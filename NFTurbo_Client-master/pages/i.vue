<template>
	<view class="page-content">
		<view class="top-content">
			<view class="avatar-nick-name">
				<view class="member-avatar">
					<u-image height="80rpx" width="80rpx" :src="getAvatar()" shape="circle"></u-image>
				</view>
				<view class="nick-name-mobile">
					<view v-show="isLogin()">
						<view class="member-nick-name">
							{{personalInfo.nickName}}
							<u-tag class="user-certification" :type="getCertificationStatus(personalInfo.certification)" :text="getCertification(personalInfo.certification)" mode="light" />
						</view>
						<view class="member-mobile">{{personalInfo.telephone}}</view>
					</view>
					<view class="login" v-show="!isLogin()" @click="loginPage">
						<view class="login-t">登录 / 注册</view>
						<view class="login-b">点击登录 享受更多精彩内容</view>
					</view>
				</view>
				<view class="setting" @click="gotoPage('/pages/setting')" v-show="isLogin()">
					<u-icon name="setting" size="48"></u-icon>
				</view>
			</view>
			<view class="block-chain-addr" v-show="isLogin()"><text
					class="block-chain-addr-l">区块链地址：{{getBlockChainAddr()}}</text>
				<u-image height="32rpx" width="32rpx" src="/static/img/copy_my.png" v-show="personalInfo.blockChainAddr"
					@click="copyData(personalInfo.blockChainAddr)"></u-image>
			</view>
		</view>
    <view class="user-quickcard">
      <view class="card" @click="collection">
        <span class="card-icon">
          <u-icon name="bag" size="38"></u-icon>
        </span>
        <span>我的藏品</span>
      </view>
      <view class="card" @click="invte()">
        <span class="card-icon">
          <u-icon name="man-add" size="38"></u-icon>
        </span>
        <span class="card-text">邀请好友</span>
      </view>
    </view>
    <view class="user-service">
      <view class="card" @click="order">
        <u-icon name="list" size="68"></u-icon>
        <span class="card-text">订单记录</span>
      </view>
      <view class="card" @click="score">
        <u-icon name="integral" size="68"></u-icon>
        <span class="card-text">积分中心</span>
      </view>
      <view class="card" @click="box">
        <u-icon name="gift" size="68"></u-icon>
        <span class="card-text">我的盲盒</span>
      </view>
      <view class="card">
        <u-icon name="coupon" size="68"></u-icon>
        <span class="card-text">礼品兑换（暂未开放)</span>
      </view>
      <view class="card">
        <u-icon name="account" size="68"></u-icon>
        <span class="card-text">关于我们（暂未开放)</span>
      </view>
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				personalInfo: '',
				customerServiceUrl: '',
        pullDownRefreshFlag: false,
      }
		},
		onLoad(option) {
		  if(!this.isLogin()) {
			this.loginPage();
			return;
		  }
			// this.getToken();
		},
		onShow() {
			this.getMyPersonalInfo();
		},
		onReachBottom() {
			this.nextPage();
		},
		onPullDownRefresh() {
			this.pullDownRefreshFlag = true;
		},
		methods: {
			gotoPage(path) {
				uni.navigateTo({
					url: path
				});
			},
			refreshData() {
				this.pageNum = 1;
				this.loadingState = 'loading';
				this.findByPage();
			},
			loginPage() {
				uni.reLaunch({
					url: "/pages/login"
				});
			},
      go2(url) {
        uni.navigateTo({
        	url
        });
      },
      invte() {
      	this.go2('/pages/invte')
      },
      collection() {
      	this.go2('/pages/collection')
      },
      order() {
        this.go2('/pages/order')
      },
      score() {
        this.go2('/pages/score')
      },
	  box() {
        this.go2('/pages/box')
      },
			isLogin() {
				const tokenValue = uni.getStorageSync('tokenValue');
				return tokenValue != null && tokenValue != '';
			},

			getBlockChainAddr() {
				if (this.personalInfo) {
					if (!this.personalInfo.certification) {
						return '实名认证后生成区块链地址...';
					} else {
						return this.personalInfo.blockChainUrl ? this.personalInfo.blockChainUrl : '等待创建区块链地址...';
					}
				}
			},

			getAvatar() {
				return this.personalInfo.profilePhotoUrl ? this.personalInfo.profilePhotoUrl : '/static/img/avatar.png';
			},

			getMyPersonalInfo() {
				if (!this.isLogin()) {
					return;
				}
				
				this.$u.get('/user/getUserInfo').then(res => {
					if(res.code == 500){
						uni.removeStorageSync('tokenValue');
					}else{
						this.personalInfo = res.data;
					}
				});
			},
			
			getCertification(s) {
				return s ? '已实名' : s === 0 ? '未实名' : '待认证';
			},
			getCertificationStatus(s) {
				return s ? 'success' : s === 0 ? 'warning' : 'info';
			}
		}
	}
</script>

<style>
	page {
		height: 100% !important;
	}

	.setting {
		color: white;
		padding-right: 32rpx;
		position: relative;
		top: -40rpx;
	}
	.user-certification {
		margin-left: 12rpx;
		vertical-align: middle;
	}
	.page-content {
		padding-bottom: 140rpx;
    background: #F5F5F5;
    height: 100%;
	}
	.top-content {
		padding-top: 64rpx;
    padding-bottom: 64rpx;
		background: linear-gradient(to right, #2f2f2f, #747171);
	}
	.avatar-nick-name {
		display: flex;
		align-items: center;
		padding-bottom: 16rpx;
		padding-left: 32rpx;
	}

	.nick-name-mobile {
		flex: 1;
	}
	.login-t {
		padding-bottom: 12rpx;
		color: white;
	}
	.login-b {
		color: #888;
		font-size: smaller;
	}
	.member-avatar {
		padding-right: 20rpx;
	}
	.member-nick-name {
		font-size: larger;
		padding-bottom: 12rpx;
		color: white;
	}
	.member-mobile {
		font-size: small;
		color: #888;
	}
	.block-chain-addr {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: 32rpx;
		padding-right: 32rpx;
		padding-bottom: 16rpx;
	}
	.block-chain-addr-l {
		color: white;
		font-size: small;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding-right: 60rpx;
	}
  
  .user-quickcard {
    display: flex;
    padding: 0 28rpx;
    position: relative;
    top: -32rpx;
  }
  .user-quickcard .card {
    flex: 1;
    margin-right: 20rpx;
    background: #FFFFFF;
    padding: 40rpx;
    border-radius: 8rpx;
    box-shadow: 0 1rpx 3rpx #EEE;
    text-decoration: none;
    color: #333;
    
    display: flex;
    align-items: center;
  }
  .user-quickcard .card:last-child {
    margin-right: 0;
  }
  .user-quickcard .card .card-icon {
    background: #CCC;
    padding: 12rpx 12rpx;
    width: 48rpx;
    height: 48rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    margin-right: 40rpx;
  }
  
  .user-service {
    display: flex;
    margin: 0 28rpx;
    background: #FFFFFF;
    flex-wrap: wrap;
    justify-content: flex-start;
    border-radius: 8rpx;
    box-shadow: 0 1rpx 3rpx #EEE;
  }
  .user-service .card {
    width: 33.33%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 40rpx 40rpx;
    color: #666;
  }
  .user-service .card .card-text {
    margin-top: 20rpx;
  }
</style>
