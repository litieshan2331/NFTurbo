<template>
	<view class="page-content">
    <view class="invte-wrap">
		<view class="user-integral" v-show="isLogin()">
		  <view class="card">
		    <span class="label">邀请码</span>
		    <span class="val">{{personalInfo.inviteCode || '暂无' }}</span>
		  </view>
		</view>
      <view class="invte-title">邀请列表</view>
      
	  <view class="invite-list">
	  	<view class="list-header">
	  		<span class="header-name">昵称</span>
	  		<span class="header-time">开通时间</span>
	  	</view>
	      <view v-for="(item, index) in inviteList" :key="index" class="list-item">
	  		
	          <span class="item-name">{{ item.nickName }}</span>
	  		
	          <span class="item-time">{{ formatTimestamp(item.createTime) }}</span>
	      </view>
	  </view>
	  
    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
        pullDownRefreshFlag: false,
		personalInfo:'',
		pageNum: 1,
		inviteList:''
      }
		},
		onLoad(option) {
		  if(!this.isLogin()) {
			this.loginPage();
			return;
		  }
		},
		onShow() {
			this.getMyPersonalInfo();
			this.getInviteList();
		},
		onReachBottom() {
			this.nextPage();
		},
		onPullDownRefresh() {
			this.pullDownRefreshFlag = true;
		},
		methods: {
			refreshData() {
				this.pageNum = 1;
				this.loadingState = 'loading';
				this.getInviteList();
			},
			getMyPersonalInfo() {
				if (!this.isLogin()) {
					return;
				}
				
				this.$u.get('/user/getUserInfo').then(res => {
					this.personalInfo = res.data;
				});
			},
			
			nextPage() {
				if (this.loadingState == 'nomore') {
					return;
				}
				this.pageNum = this.pageNum + 1;
				this.getInviteList();
			},
			
			getInviteList() {
				if (!this.isLogin()) {
					return;
				}
				
				this.loadingState = 'loading';
				
				this.$u.get('/user/invite/getInviteList', {
					currentPage: this.pageNum
				}).then(res => {
					
					if(res.data.length == 0) {
						this.noDataFlag = true;
						return;
					}
					
					this.noDataFlag = false;
					this.inviteList = res.data;
					
					if (this.pullDownRefreshFlag) {
						this.pullDownRefreshFlag = false;
						uni.stopPullDownRefresh();
					}
					
					if (this.inviteList.length == res.total) {
						this.loadingState = 'nomore';
					}
			
				});
			},
			
			
			loginPage() {
				uni.reLaunch({
					url: "/pages/login"
				});
			},
			isLogin() {
				const tokenValue = uni.getStorageSync('tokenValue');
				return tokenValue != null && tokenValue != '';
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
		}
	}
</script>

<style>
	page {
		height: 100% !important;
	}

	.page-content {
		padding-bottom: 140rpx;
    height: 100%;
	}
  
  .user-integral {
    margin: 40rpx 28rpx;
    background: #E5E5E5;
    border-radius: 8rpx;
    display: flex;
  }
  .user-integral .card {
    width: 50%;
    padding: 40rpx;
    display: flex;
    flex-direction: column;
  }
  .user-integral .card .label {
    font-weight: 700;
  }
  .user-integral .card .val {
    margin-top: 20rpx;
    font-size: 56rpx;
  }
  
  .invte-wrap {
    margin: 80rpx 28rpx 0;
  }
  .invte-wrap .invte-title {
    text-align: center;
    font-size: 32rpx;
    font-weight: 700;
  }
  
  .invite-list {
      background-color: #f9f9f9; /* 背景色 */
      border-radius: 8px; /* 圆角 */
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 阴影 */
      padding: 20px; /* 内边距 */
  }
  
  .list-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      border-bottom: 2px solid #e0e0e0; /* 分隔线 */
      padding-bottom: 10px;
      margin-bottom: 10px;
  }
  
  .header-name, .header-time {
      flex: 1;
      text-align: center;
  }
  
  .list-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0; /* 分隔线 */
  }
  
  .list-item:last-child {
      border-bottom: none; /* 最后一项不显示下边框 */
  }
  
  .item-name {
      flex: 1;
      text-align: center;
      color: #333; /* 字体颜色 */
  }
  
  .item-time {
      flex: 1;
      text-align: center;
      color: #777; /* 字体颜色 */
  }

</style>
