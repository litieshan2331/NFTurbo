<template>
	<view class="page-content">
		<view class="search-box">
			<u-search
				v-model="keyword"
				:show-action="false"
				placeholder="请输入藏品名称搜索"
				:clearabled="true"
				@change="onSearch"
			></u-search>
		</view>
		
		<view class="total-count" v-if="total > 0">
			<view class="count-row">
				<text>共持有 </text>
				<text class="count">{{total}}</text>
				<text> 件藏品</text>
			</view>
			<view class="level-row">
				<text>收藏等级：</text>
				<text class="level">{{collectorLevel}}</text>
			</view>
			<view class="search-result" v-if="keyword">
				<text>搜索到 </text>
				<text class="result-count">{{searchResultCount}}</text>
				<text> 条结果</text>
			</view>
		</view>
		
		<view class="total-count" v-else-if="keyword">
			<view class="search-result">
				<text>搜索到 </text>
				<text class="result-count">{{searchResultCount}}</text>
				<text> 条结果</text>
			</view>
		</view>
		
		<view>
			<view class="no-data" v-show="noDataFlag">
				<u-empty text="暂无数据" mode="favor"></u-empty>
			</view>
			<view>
				<view class="order-record" v-for="orderRecord in orderRecords">
					<view class="order-record-content">
						<view class="order-record-header">
							<view class="order-record-id">
								藏品编号：#{{orderRecord.serialNo}}
							</view>
							<view class="action-btn">
								<u-button :custom-style="transferBtnStyle" @click="showTransferModal(orderRecord.id)">转让</u-button>
								<u-button :custom-style="destroyBtnStyle" @click="showDestroyConfirm(orderRecord.id)">销毁</u-button>
							</view>
						</view>

						<view class="order-record-main">
							<view class="cover-image">
								<view class="image-wrapper">
									<u-image class="collection-cover" width="180rpx" height="180rpx" border-radius="10"
										:src="orderRecord.cover">
									</u-image>
									<view class="rarity-tag" v-if="orderRecord.rarity">
										<text :class="['rarity-text', getRarityClass(orderRecord.rarity)]">{{getRarityText(orderRecord.rarity)}}</text>
									</view>
								</view>
							</view>
							<view class="order-info">
								<view class="product-name">{{orderRecord.name}}</view>
								<view class="price-container">
									<view class="price-item">
										
										<text class="price-value">￥{{moneyFormat(orderRecord.purchasePrice)}}</text>
									</view>
								</view>
								<view class="source-info">
									<text class="source-label">来源：</text>
									<text class="source-value">{{ getSourceText(orderRecord.bizType) }}</text>
								</view>
								<view class="source-info" v-if="shouldShowBizNo(orderRecord.bizType)">
									<text class="source-label">订单号：</text>
									<text class="source-value">{{ orderRecord.bizNo }}</text>
								</view>
								<view class="order-time">{{formatTimestamp(orderRecord.holdTime)}} </view>
							</view>
						</view>

					</view>
				</view>
			</view>

		</view>

		<view class="modal-mask" v-if="showTransferModalFlag" @click.stop>
			<view class="modal-content">
				<view class="transfer-modal">
					<view class="transfer-title">转让藏品</view>
					
					<view v-if="transferStep === 1">
						<u-input
							v-model="transferPhone"
							type="number"
							placeholder="请输入接收方手机号"
							:border="true"
							class="transfer-input"
							maxlength="11"
						></u-input>
						<view class="transfer-btns">
							<u-button :custom-style="cancelBtnStyle" @click="cancelTransfer">取消</u-button>
							<u-button :custom-style="confirmBtnStyle" @click="queryUser">查询用户</u-button>
						</view>
					</view>

					<view v-if="transferStep === 2">
						<view class="confirm-user-info">
							<view class="user-avatar">
								<u-avatar
									:src="recipientAvatar"
									size="80"
									shape="circle"
								></u-avatar>
							</view>
							<view class="user-info-content">
								<view class="user-name">{{recipientUserName}}</view>
								<view class="user-phone">{{transferPhone}}</view>
							</view>
						</view>
						<view class="transfer-warning">请确认接收方信息正确后再进行转让</view>
						<view class="transfer-btns">
							<u-button :custom-style="cancelBtnStyle" @click="backToStep1">返回</u-button>
							<u-button :custom-style="confirmBtnStyle" @click="confirmTransfer">确认转让</u-button>
						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="showDestroyModalFlag" @click.stop>
			<view class="modal-content">
				<view class="destroy-modal">
					<view class="destroy-icon">
						<u-icon name="warning-fill" color="#ff4444" size="60"></u-icon>
					</view>
					<view class="destroy-title">确认销毁</view>
					<view class="destroy-content">
						<text>销毁后藏品将永久消失</text>
						<text>此操作不可恢复，请谨慎操作</text>
					</view>
					<view class="destroy-btns">
						<u-button :custom-style="cancelBtnStyle" @click="showDestroyModalFlag = false">取消</u-button>
						<u-button :custom-style="destroyConfirmBtnStyle" @click="handleDestroyConfirm">确认销毁</u-button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	
	export default {
		data() {
			return {
				total: 0,
				keyword: '',
				pageNum: 1,
				loadingState: 'loadmore',
				pullDownRefreshFlag: false,
				noDataFlag: false,
				orderRecords: [],
				showPayModalFlag: false,
				showCancelModalFlag: false,
				selectedOrder: '',
				tokenId: '',
				showPayQRCode: false,
				payQRCodeURL: '',
				checkToken: '',
				payOrderId: '',
				searchResultCount: 0,
				showTransferModalFlag: false,
				transferStep: 1,
				transferPhone: '',
				recipientUserName: '',
				recipientAvatar: '',
				recipientUserId: '',
				selectedItemId: '',
				transferBtnStyle: {
					width: '100rpx',
					height: '48rpx',
					lineHeight: '48rpx',
					fontSize: '24rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #4169E1, #1E90FF)',
					border: 'none',
					borderRadius: '24rpx',
					padding: '0'
				},
				cancelBtnStyle: {
					width: '180rpx',
					height: '80rpx',
					fontSize: '32rpx',
					color: '#666',
					background: '#f5f5f5',
					border: 'none',
					borderRadius: '40rpx',
				},
				confirmBtnStyle: {
					width: '180rpx',
					height: '80rpx',
					fontSize: '32rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #ff6b6b, #ff9f9f)',
					border: 'none',
					borderRadius: '40rpx',
					boxShadow: '0 4rpx 16rpx rgba(255, 107, 107, 0.35)',
				},
				destroyBtnStyle: {
					width: '100rpx',
					height: '48rpx',
					lineHeight: '48rpx',
					fontSize: '24rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #ff6b6b, #ff9f9f)',
					border: 'none',
					borderRadius: '24rpx',
					padding: '0',
					marginLeft: '20rpx'
				},
				showDestroyModalFlag: false,
				destroyConfirmBtnStyle: {
					width: '180rpx',
					height: '80rpx',
					fontSize: '32rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #ff4444, #ff6b6b)',
					border: 'none',
					borderRadius: '40rpx',
					boxShadow: '0 4rpx 16rpx rgba(255, 68, 68, 0.35)',
				}
			}
		},
		onLoad() {
			this.getCollectionCount();
			this.findByPage();
		},
		onReachBottom() {
			this.nextPage();
		},
		onPullDownRefresh() {
			this.pullDownRefreshFlag = true;
			this.refreshData();
		},
		methods: {

			moneyFormat(money, len) {
				len = len || 2
				if (!money && money !== 0)
					return ''
				if (isNaN(+money))
					return ''
				if (money === 0 || money === '0')
					return '0.' + '0'.repeat(len)
				const arr = (money + '').split('.')
				const intStr = arr[0] ? arr[0] : 0
				let floatStr = arr[1] ? arr[1] : 0
				if (floatStr === 0) {
					floatStr = '0'.repeat(len)
				} else {
					floatStr = (+('0.' + floatStr)).toFixed(len).split('.')[1]
				}
				money = (intStr + '.' + floatStr).replace(/(\d{1,3})(?=(?:\d{3})+\.)/g, `$1,`);
				return money
			},

		
			formatTimestamp(timestamp) {
				const date = new Date(timestamp);
				const year = date.getFullYear();
				const month = ('0' + (date.getMonth() + 1)).slice(-2); // 加1是因为月份从0开始
				const day = ('0' + date.getDate()).slice(-2);
				const hours = ('0' + date.getHours()).slice(-2);
				const minutes = ('0' + date.getMinutes()).slice(-2);
				const seconds = ('0' + date.getSeconds()).slice(-2);
				return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
			},
			
			payOrderDetailPage(id) {
				uni.navigateTo({
					url: '/pages/orderDetail?id=' + id
				});
			},

			refreshData() {
				this.pageNum = 1;
				this.loadingState = 'loading';
				this.findByPage();
			},

			nextPage() {
				if (this.loadingState == 'nomore') {
					return;
				}
				this.pageNum = this.pageNum + 1;
				this.findByPage();
			},

			findByPage() {
				if (this.pageNum == 1) {
					this.orderRecords = [];
				}
				const queryParam = {
					pageSize: 10,
					currentPage: this.pageNum,
					keyword: this.keyword,
					state: 'ACTIVED'
				};
				
				this.loadingState = 'loading';
				this.$u.get('/collection/heldCollectionList', queryParam).then(res => {
					if(res.data.length == 0) {
						this.noDataFlag = true;
						this.searchResultCount = 0;
						return;
					}
					
					this.noDataFlag = false;
					this.orderRecords = this.orderRecords.concat(res.data);
					this.searchResultCount = res.total;
					
					if (this.pullDownRefreshFlag) {
						this.pullDownRefreshFlag = false;
						uni.stopPullDownRefresh();
					}
					
					if (this.orderRecords.length == res.total) {
						this.loadingState = 'nomore';
					}
				});
			},

			onSearch(keyword) {
				this.pageNum = 1;
				this.findByPage();
				this.getCollectionCount();
			},

			getCollectionCount() {
				this.$u.get('/collection/heldCollectionCount').then(res => {
					this.total = res.data;
				});
			},

			getRarityClass(rarity) {
				const rarityMap = {
					'MYTHICAL': 'mythical',
					'UNIQUE': 'unique',
					'LEGENDARY': 'legendary',
					'EPIC': 'epic',
					'RARE': 'rare',
					'COMMON': 'common'
				};
				return rarityMap[rarity] || 'common';
			},

			getRarityText(rarity) {
				const rarityTextMap = {
					'MYTHICAL': '神话',
					'UNIQUE': '独特',
					'LEGENDARY': '传说',
					'EPIC': '史诗',
					'RARE': '稀有',
					'COMMON': '普通'
				};
				return rarityTextMap[rarity] || '普通';
			},

			showTransferModal(itemId) {
				console.log('转让藏品ID:', itemId);
				this.selectedItemId = itemId.toString();
				this.showTransferModalFlag = true;
				this.transferStep = 1;
				this.transferPhone = '';
				this.recipientUserName = '';
				this.recipientAvatar = '';
				this.recipientUserId = '';
			},

			cancelTransfer() {
				this.showTransferModalFlag = false;
			},

			backToStep1() {
				this.transferStep = 1;
			},

			queryUser(phone) {
				if (!this.transferPhone) {
					uni.showToast({
						icon: 'none',
						title: '请输入手机号'
					});
					return;
				}
				
				if (!/^1[3-9]\d{9}$/.test(this.transferPhone)) {
					uni.showToast({
						icon: 'none',
						title: '请输入正确的手机号'
					});
					return;
				}

				this.$u.get('/user/queryUserByTel', {
					telephone: this.transferPhone
				}).then(res => {
					console.log('查询结果：', res);
					if (!res.success || !res.data) {
						uni.showToast({
							icon: 'none',
							title: '未找到该用户'
						});
						return;
					}
					this.recipientUserName = res.data.nickName;
					this.recipientAvatar = res.data.profilePhotoUrl || '/static/img/default-avatar.png';
					this.recipientUserId = res.data.userId;
					this.transferStep = 2;
				});
			},

			confirmTransfer() {
				this.$u.post('/collection/transfer', {
					heldCollectionId: this.selectedItemId,
					recipientUserId: this.recipientUserId
				}).then(res => {
					if (!res.success) {
						uni.showToast({
							icon: 'none',
							title: '转让失败'
						});
						return;
					}
					uni.showToast({
						icon: 'success',
						title: '转让成功'
					});
					this.showTransferModalFlag = false;
					this.refreshData();
				});
			},

			showDestroyConfirm(itemId) {
				this.selectedItemId = itemId.toString();
				this.showDestroyModalFlag = true;
			},

			destroyCollection(itemId) {
				this.$u.post('/collection/destroy', {
					heldCollectionId: itemId.toString()
				}).then(res => {
					if (!res.success) {
						uni.showToast({
							icon: 'none',
							title: '销毁失败'
						});
						return;
					}
					uni.showToast({
						icon: 'success',
						title: '销毁成功'
					});
					this.refreshData();
				});
			},

			handleDestroyConfirm() {
				this.destroyCollection(this.selectedItemId);
				this.showDestroyModalFlag = false;
			},

			getSourceText(bizType) {
				const sourceMap = {
					'PRIMARY_TRADE': '藏品',
					'BLIND_BOX_TRADE': '盲盒',
					'AIR_DROP': '空投',
					'TRANSFER': '转赠'
				};
				return sourceMap[bizType] || '未知来源';
			},
			
			shouldShowBizNo(bizType) {
				return ['PRIMARY_TRADE', 'BLIND_BOX_TRADE'].includes(bizType);
			}
		},
		computed: {
			collectorLevel() {
				if (this.total >= 100) return '藏品大师';
				if (this.total >= 50) return '资深藏家';
				if (this.total >= 30) return '藏品达人';
				if (this.total >= 20) return '高级收藏家';
				if (this.total >= 10) return '中级收藏家';
				if (this.total >= 5) return '初级收藏家';
				return '收藏新手';
			}
		}
	}
</script>

<style>
	.pay-modal-pay-qrcode {
		margin: 20rpx auto 60rpx;
		width: 300rpx;
		height: 300rpx;
		
		img{
			width: 100%;
			height: 100%;
		}
	}

	.order-record {
		padding-left: 32rpx;
		padding-right: 32rpx;
		padding-bottom: 20rpx;
	}


	.order-record-content {
		background: #ffffff;
		padding: 20rpx;
		border-radius: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
	}

	.order-record-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 20rpx;
		border-bottom: 1px solid #f5f5f5;
	}

	.order-record-id {
		color: #666;
		font-size: 26rpx;
	}

	.order-state {
		font-size: 26rpx;
	}

	.order-record-main {
		display: flex;
		padding: 20rpx 0;
	}

	.cover-image {
		margin-right: 20rpx;
		position: relative;
	}

	.image-wrapper {
		position: relative;
		width: 180rpx;
		height: 180rpx;
	}

	.rarity-tag {
		position: absolute;
		top: -6rpx;
		right: -6rpx;
		z-index: 1;
	}

	.rarity-text {
		display: inline-block;
		padding: 4rpx 12rpx;
		border-radius: 6rpx;
		font-size: 20rpx;
		font-weight: bold;
		white-space: nowrap;
	}

	.order-info {
		flex: 1;
	}

	.product-name {
		font-size: 30rpx;
		font-weight: bold;
		margin-bottom: 10rpx;
		color: #333;
	}

	.buyer-info {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 10rpx;
	}

	.price-container {
		margin: 16rpx 0;
	}

	.price-item {
		display: flex;
		flex-direction: column;
	}

	.price-label {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 4rpx;
	}

	.price-value {
		font-size: 32rpx;
		color: #ff6b6b;
		font-weight: bold;
	}

	.order-time {
		font-size: 24rpx;
		color: #999;
	}

	.order-record-actions {
		display: flex;
		justify-content: flex-end;
		padding-top: 20rpx;
		gap: 20rpx;
	}

	.cancel-btn {
		padding-right: 28rpx;
	}

	.collection-name {
		display: flex;
		justify-content: space-between;
	}

	.collection-name-l {
		font-weight: bold;
	}

	.collection-name-r {}

	.search-box {
		padding: 20rpx 32rpx;
		background-color: #ffffff;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.total-count {
		padding: 20rpx 32rpx;
		font-size: 28rpx;
		color: #666;
		background: #ffffff;
		border-bottom: 2rpx solid #f5f5f5;
	}
	
	.count-row {
		margin-bottom: 10rpx;
	}

	.total-count .count {
		color: #ff6b6b;
		font-weight: bold;
		font-size: 32rpx;
		margin: 0 6rpx;
	}

	.level-row {
		color: #666;
	}

	.level-row .level {
		color: #ff9500;
		font-weight: bold;
		font-size: 30rpx;
		margin-left: 6rpx;
	}

	.search-result {
		margin-top: 10rpx;
		font-size: 26rpx;
		color: #666;
	}

	.search-result .result-count {
		color: #2979ff;
		font-weight: bold;
		font-size: 28rpx;
		margin: 0 6rpx;
	}

	.rarity-tag {
		margin: 10rpx 0;
	}

	.rarity-text {
		display: inline-block;
		padding: 4rpx 16rpx;
		border-radius: 6rpx;
		font-size: 24rpx;
		font-weight: bold;
	}

	.mythical {
		background: linear-gradient(45deg, #FF1493, #9400D3);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(148, 0, 211, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.unique {
		background: linear-gradient(45deg, #FF4500, #FF8C00);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(255, 69, 0, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.legendary {
		background: linear-gradient(45deg, #FFD700, #FFA500);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(255, 215, 0, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.epic {
		background: linear-gradient(45deg, #9932CC, #800080);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(153, 50, 204, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.rare {
		background: linear-gradient(45deg, #1E90FF, #4169E1);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(30, 144, 255, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.common {
		background: linear-gradient(45deg, #808080, #696969);
		color: #ffffff;
		box-shadow: 0 2rpx 8rpx rgba(128, 128, 128, 0.4);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.transfer-modal {
		background: #ffffff;
		padding: 40rpx;
		width: 600rpx;
		border-radius: 16rpx;
	}

	.transfer-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.transfer-input {
		margin: 20rpx 0 40rpx;
	}

	.transfer-btns {
		display: flex;
		justify-content: center;
		margin-top: 40rpx;
	}

	.confirm-user-info {
		background: #f8f8f8;
		padding: 30rpx;
		border-radius: 12rpx;
		margin: 20rpx 0;
		display: flex;
		align-items: center;
	}

	.user-avatar {
		margin-right: 20rpx;
	}

	.user-info-content {
		flex: 1;
	}

	.user-name {
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
		margin-bottom: 8rpx;
	}

	.user-phone {
		font-size: 24rpx;
		color: #666;
	}

	.transfer-warning {
		color: #ff6b6b;
		font-size: 24rpx;
		text-align: center;
		margin: 20rpx 0;
	}

	.button-wrapper {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}

	.modal-mask {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.6);
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.modal-content {
		transform: scale(1);
		animation: modalIn 0.3s ease-out;
	}

	@keyframes modalIn {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.action-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	:deep(.u-button) {
		transition: all 0.3s ease;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	:deep(.u-button:active) {
		transform: scale(0.95);
		opacity: 0.9;
		box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
	}

	.user-info {
		background: #f8f8f8;
		padding: 30rpx;
		border-radius: 12rpx;
		margin: 20rpx 0;
		display: flex;
		align-items: center;
	}

	.user-avatar {
		margin-right: 20rpx;
	}

	.user-name {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		font-weight: bold;
	}

	.destroy-modal {
		background: #ffffff;
		padding: 40rpx;
		width: 600rpx;
		border-radius: 16rpx;
		text-align: center;
	}

	.destroy-icon {
		margin-bottom: 20rpx;
	}

	.destroy-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 30rpx;
	}

	.destroy-content {
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		color: #666;
		font-size: 28rpx;
		margin-bottom: 40rpx;
	}

	.destroy-btns {
		display: flex;
		justify-content: center;
		gap: 30rpx;
	}

	.source-info {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		margin-bottom: 8rpx;
	}

	.source-label {
		color: #999;
		margin-right: 10rpx;
	}

	.source-value {
		color: #666;
	}
</style>
