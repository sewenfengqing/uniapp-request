<template>
	<view class="container">
		<button :disabled="logining" @click="login()">登录测试示例</button>
		<button @click="getNum()">除登录外的业务网络请求示例</button>
	</view>
</template>

<script>
// import Http from '../../common/http.js'
var _self;
export default {
	data() {
		return {
			logining: false,
			mobile:"15638780530",
			password:"ly250",
		}
	},
	methods: {
		login:function(){
			if(!this.Http.hasNetwork()){
				return;
			}
			if(this.mobile == "" || this.password == ""){
				uni.showToast({
					title: "请输入完整信息",
					icon:'none'
				});
				return;
			}
			this.logining = true;
			this.Http.sendLoginOrRegisterRequest({
				url : "user/loginApp",
				data: {
					username : this.mobile,
					password : this.password
				},
				success:function(res){
					// uni.setStorageSync("sessionKey",res.token);
					_self.Http.setSession(res.token);
					uni.showToast({
						title: '登录成功',
						icon:'none'
					});
				},
				fail:function(e){},
				complete:function(){
					_self.logining = false;
				}
			})
		},
		getNum:function(){
			this.Http.sendRequest({
				url : "index/index",
				success:function(res){
					console.log("getNum:"+ JSON.stringify(res));
					uni.showToast({
						title: "success",
						icon:'none'
					});
				},
				fail:function(e){},
				complete:function(){}
			})
		},
	},
	onLoad:function(){
		_self = this;
	}
}
</script>

<style>

</style>
