<template>
	<view class="page-content">

    <view class="user-integral" v-show="isLogin()">
      <view class="card">
        <span class="label">邀请码</span>
        <span class="val">{{personalInfo.inviteCode || '暂无'}}</span>
      </view>
	  
	 <view class="card">
	    <span class="label">我的排名</span>
	    <span class="val">{{myRank || '未上榜'}}</span>
	  </view>
    </view>
	    <view class="top-n-list">
	        <span class="list-title">邀请排行榜</span>
			<view class="list-header">
				<span class="header-rank">排名</span>
				<span class="header-name">昵称</span>
				<span class="header-score">分数</span>
			</view>
	        <view v-for="(item, index) in topN" :key="index" class="list-item">
				<span class="item-rank">第{{ index + 1 }}名</span>
				
	            <span class="item-name">{{ item.nickName }}</span>
				
	            <span class="item-score">{{ item.inviteScore}}</span>
	        </view>
	    </view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				personalInfo: '',
				myRank:'',
				topN:'',
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
			this.getMyRank();
			this.getTop10();
		},
		
		
		methods: {
			
			getMyPersonalInfo() {
				if (!this.isLogin()) {
					return;
				}
				
				this.$u.get('/user/getUserInfo').then(res => {
					this.personalInfo = res.data;
				});
			},
			
			
			getMyRank() {
				if (!this.isLogin()) {
					return;
				}
				
				this.$u.get('/user/invite/getMyRank').then(res => {
					this.myRank = res.data;
				});
			},
			
			
			getTop10() {
				if (!this.isLogin()) {
					return;
				}
				
				this.$u.get('/user/invite/getTopN', {
					topN: 10
				}).then(res => {
					this.topN = res.data;
				});
			},
			
			
			refreshData() {
				this.pageNum = 1;
				this.loadingState = 'loading';
				this.findByPage();
			},
			
			isLogin() {
				const tokenValue = uni.getStorageSync('tokenValue');
				return tokenValue != null && tokenValue != '';
			}
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
    margin: 80rpx 28rpx 40rpx;
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
  
  .top-n-list {
      background: #ffffff;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .list-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
  }
  
  .list-header, .list-item {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
  }
  
  .list-header {
      border-bottom: 2px solid #007bff;
      margin-bottom: 10px;
  }
  
  .header-rank, .header-name, .header-score, .item-rank, .item-name, .item-score {
      flex: 1;
      text-align: center; /* 使文本居中对齐 */
  }
  
  .header-rank, .header-name, .header-score {
      font-weight: bold;
      color: #007bff;
  }
  
  .item-rank {
      font-weight: bold;
      color: #007bff;
  }
  
  .item-name {
      flex-grow: 2; /* 确保昵称占用更多空间 */
  }
  
  .item-score {
      font-weight: bold;
      color: #28a745;
  }
</style>
