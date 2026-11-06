<template>
	<view class="box-container">
		<view class="page-content">
			<view class="search-box">
				<u-search
					v-model="keyword"
					:show-action="false"
					placeholder="请输入盲盒名称搜索"
					:clearabled="true"
					@change="onSearch"
				></u-search>
			</view>
			
			<view class="total-count" v-if="keyword">
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

							<view class="order-record-main">
								<view class="cover-image">
									<u-image class="collection-cover" width="180rpx" height="180rpx" border-radius="10"
										:src="orderRecord.cover">
									</u-image>
								</view>
								<view class="order-info">
									<view class="info-row">
										<view class="product-name">{{orderRecord.name}}</view>
										<view class="price-info">￥{{moneyFormat(orderRecord.price)}}</view>
									</view>
									<view class="order-time">{{formatTimestamp(orderRecord.buyTime)}}</view>
									<view class="button-wrapper">
										<u-button :custom-style="customActionBtnStyle" type="primary" @click="openBox(orderRecord.itemId)">立即开盒</u-button>
									</view>
								</view>
							</view>

						</view>
					</view>
				</view>
			</view>
		</view>

		<view class="modal-mask" v-if="showOpenResultModal" @click.stop>
			<view class="modal-content">
				<view class="open-result-modal">
					<view class="open-result-header">
						<text class="success-title">开盒成功</text>
						<text class="rarity-tag" :style="getRarityStyle(openedCollection.rarity)">{{getRarityText(openedCollection.rarity)}}</text>
					</view>
					
					<view class="collection-image">
						<u-image width="300rpx" height="300rpx" :src="openedCollection.collectionCover" border-radius="10"></u-image>
					</view>
					
					<view class="collection-info">
						<view class="collection-name">{{openedCollection.collectionName}}</view>
						<view class="collection-serial">编号：{{openedCollection.collectionSerialNo}}</view>
						<view class="open-time">开盒时间：{{formatTimestamp(openedCollection.openedTime)}}</view>
					</view>
					
					<view class="modal-footer">
						<u-button :custom-style="confirmBtnStyle" @click="handleOpenResultConfirm">收下</u-button>
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
				customActionBtnStyle: {
					width: '160rpx',
					height: '60rpx',
					fontSize: '26rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #ff6b6b, #ff9f9f)',
					border: 'none',
					borderRadius: '30rpx',
					boxShadow: '0 4rpx 16rpx rgba(255, 107, 107, 0.35)',
					marginTop: '10rpx'
				},
				showOpenResultModal: false,
				openedCollection: {
					collectionName: '',
					collectionCover: '',
					collectionSerialNo: '',
					openedTime: '',
					rarity: ''
				},
				confirmBtnStyle: {
					width: '240rpx',
					height: '80rpx',
					fontSize: '32rpx',
					color: '#ffffff',
					background: 'linear-gradient(to right, #ff6b6b, #ff9f9f)',
					border: 'none',
					borderRadius: '40rpx',
					boxShadow: '0 4rpx 16rpx rgba(255, 107, 107, 0.35)',
				}
			}
		},
		onLoad() {
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
			
			openBox(id){
				this.$u.post('/box/openBlindBox', {
					itemId: id
				}).then(res => {
					if (!res.success) {
						uni.showToast({
							icon: 'error',
							title: '开盒失败'
						});
						return;
					}
					this.openedCollection = res.data;
					this.showOpenResultModal = true;
				});
			},

			findByPage() {
				if (this.pageNum == 1) {
					this.orderRecords = [];
				}
				const queryParam = {
					pageSize: 10,
					currentPage: this.pageNum,
					keyword: this.keyword
				};
				
				this.loadingState = 'loading';
				this.$u.get('/box/heldBoxList', queryParam).then(res => {
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

			handleOpenResultConfirm() {
				this.showOpenResultModal = false;
				this.refreshData();
			},

			getRarityStyle(rarity) {
				const styles = {
					'MYTHICAL': {
						background: 'linear-gradient(45deg, #FFD700, #FF4500)',
						color: '#fff'
					},
					'UNIQUE': {
						background: 'linear-gradient(45deg, #FF1493, #C71585)',
						color: '#fff'
					},
					'LEGENDARY': {
						background: 'linear-gradient(45deg, #FFD700, #FFA500)',
						color: '#fff'
					},
					'EPIC': {
						background: 'linear-gradient(45deg, #9400D3, #8A2BE2)',
						color: '#fff'
					},
					'RARE': {
						background: 'linear-gradient(45deg, #4169E1, #0000FF)',
						color: '#fff'
					},
					'COMMON': {
						background: 'linear-gradient(45deg, #808080, #A9A9A9)',
						color: '#fff'
					}
				};
				return {
					background: styles[rarity]?.background || styles['COMMON'].background,
					color: styles[rarity]?.color || '#fff'
				};
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
			}

		}
	}
</script>

<style>
	.box-container {
		width: 100%;
		min-height: 100vh;
		background: #f5f5f5;
		position: relative;
	}

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

	.price-info {
		font-size: 32rpx;
		color: #ff6b6b;
		font-weight: bold;
		margin-bottom: 10rpx;
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

	/* 按钮悬停效果 */
	:deep(.u-button--primary) {
		transition: all 0.3s ease;
	}

	:deep(.u-button--primary:active) {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(255, 107, 107, 0.25);
	}

	.open-result-modal {
		background: #ffffff;
		padding: 40rpx;
		width: 600rpx;
		border-radius: 16rpx;
	}

	.open-result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.success-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.rarity-tag {
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		font-weight: bold;
	}

	.collection-image {
		display: flex;
		justify-content: center;
		margin: 20rpx 0;
	}

	.collection-info {
		text-align: center;
		margin: 30rpx 0;
	}

	.collection-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
	}

	.collection-serial {
		font-size: 26rpx;
		color: #666;
		margin-bottom: 12rpx;
	}

	.open-time {
		font-size: 24rpx;
		color: #999;
	}

	.modal-footer {
		display: flex;
		justify-content: center;
		margin-top: 40rpx;
	}

	/* 弹出动画效果 */
	:deep(.u-popup) {
		transform-origin: center;
		animation: popIn 0.3s ease-out;
	}

	@keyframes popIn {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
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
</style>
