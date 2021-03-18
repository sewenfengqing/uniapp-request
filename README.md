# uniapp-request
uniapp网络请求封装

 1. http.js中封装了网络请求
```
const baseUrl = "https://***.com.cn"
const sessionKey = "sessionKey";

//网络判断
const hasNetwork = function(){
	var result = true;
	uni.getNetworkType({
		success: function (res) {
			// console.log("网络类型:" + res.networkType);
			if(res.networkType == "none"){
				uni.showToast({
					title:"网络未连接",
					icon:'none'
				});
				result = false;
			}
		}
	});
	return result;
}
//登录请求+注册请求+忘记密码
const sendLoginOrRegisterRequest = function(param){
	
	// if(!hasNetwork()){//移到页面中判断：适配按钮状态变化的逻辑
	// 	return;
	// }
	
	var _self = this, data = param.data || {}, siteBaseUrl = baseUrl + "/" + param.url;
	var timestamp = Date.parse(new Date());//时间戳
	data["timestamp"] = timestamp;
	data["device"] = "APP";
	// // #ifdef APP-PLUS
	// data["device"] = "APP";
	// // #endif
	// // #ifdef H5
	// data["device"] = "H5";
	// // #endif
	data["version"] = "V1.0.0";
	uni.request({
		url: siteBaseUrl,
		method: 'POST',
		//header: {'content-type' : "application/json"},//默认
		header: {'content-type' : "application/x-www-form-urlencoded"},
		data: data,
		success:function(res){
			// console.log("网络请求success:" + JSON.stringify(res));
			if (res.statusCode && res.statusCode != 200) {//api错误(Error StatusCode)
				uni.showToast({
					/* title:res.errMsg */
					title:"api错误",
					icon:'none'
				});
				
				return;
			}
			if (res.data.code) {
				if (res.data.code != "0") {//Error ResultCode
					uni.showToast({
						title:res.data.msg,
						icon:'none'
					});
					
					return;
				}
			} else {//No ResultCode
				uni.showToast({
					/* title:res.data.msg */
					title:"无结果码",
					icon:'none'
				});
				
				return;
			}
			typeof param.success == "function" && param.success(res.data.res);
		},
		fail:function(e){
			// console.log("网络请求fail:" + JSON.stringify(e));
			uni.showToast({
				/* title:e.errMsg */
				title:"请检查网络",
				icon:'none'
			});
			
			typeof param.fail == "function" && param.fail(e.data);
		},
		complete:function(){
			// console.log("网络请求complete");
			typeof param.complete == "function" && param.complete();
			return;
		}
	});
}

//封装除登录外的业务网络请求
const sendRequest = function(param){
	if(!hasNetwork()){//移到页面中判断：适配按钮状态变化的逻辑
		return;
	}
	var _self = this, 
		url = param.url,
		method = param.method,
		header = {},
		data = param.data || {}, 
		token = "",
		// hideLoading = param.hideLoading || true;//注意：boolean默认取值的写法在此处不生效(或运算恒为true)
		hideLoading = param.hideLoading === undefined ? true : param.hideLoading;
		// console.log("hideLoading:" + hideLoading);
	//拼接完整请求地址
	var requestUrl = baseUrl + "/" + url;
	//固定参数:仅仅在小程序绑定页面通过code获取token的接口默认传递了参数token = login
	if(!data.token){//其他业务接口传递过来的参数中无token
		token = uni.getStorageSync(sessionKey);//参数中无token时在本地缓存中获取
		// console.log("当前token:" + token);
		if(!token){//本地无token需重新登录(退出时清缓存token)
			uni.redirectTo({url:'/pages/login/login'});
			return;
		}else{
			data.token = token;
		}
	}
	var timestamp = Date.parse(new Date());//时间戳
	data["timestamp"] = timestamp;
	data["device"] = "APP";
	data["version"] = "V1.0.0";
	
	//请求方式:GET或POST(POST需配置header: {'content-type' : "application/x-www-form-urlencoded"},)
	if(method){
		method = method.toUpperCase();//小写改为大写
		if(method=="POST"){
			header = {'content-type' : "application/x-www-form-urlencoded"};
		}else{
			header = {'content-type' : "application/json"};
		}
	}else{
		method = "GET";
		header = {'content-type' : "application/json"};
	}
	
	// console.log(header, param.header);
	// header = {...header, ...param.header};
	// console.log(header);
	
	//用户交互:加载圈
	if (!hideLoading) {
		uni.showLoading({
			title:'Loading...',
		});
	}
	
	// console.log("网络请求start：url:" + requestUrl + "，params:" +JSON.stringify(data));
	//网络请求
	uni.request({
		url: requestUrl,
		method: method,
		header: header,
		data: data,
		success: res => {
			// console.log("网络请求success:" + JSON.stringify(res));
			if (res.statusCode && res.statusCode != 200) {//api错误
				uni.showToast({
					/* title: res.errMsg */
					title:"api错误",
					icon:'none'
				});
				return;
			}
			if (res.data.code) {//返回结果码code判断:0成功,1错误,-1未登录(未绑定/失效/被解绑)
				if (res.data.code == "-1") {
					uni.redirectTo({url:'/pages/login/login'});
					return;
				}
				if (res.data.code != "0") {//code为1失败，code为0成功
					uni.showToast({
						title: res.data.msg,
						icon:'none'
					});
					return;
				}
			} else{
				uni.showToast({
					/* title: res.data.msg */
					title:"无结果码",
					icon:'none'
				});
				return;
			}
			typeof param.success == "function" && param.success(res.data);
		},
		fail: (e) => {
			// console.log("网络请求fail:" + JSON.stringify(e));
			uni.showToast({
				/* title: e.errMsg */
				title:"请检查网络",
				icon:'none'
			});
			
			typeof param.fail == "function" && param.fail(e.data);
		},
		complete: () => {
			// console.log("网络请求complete");
			if (!hideLoading) {
				uni.hideLoading();
			}
			typeof param.complete == "function" && param.complete();
			return;
		}
	});
}

//上传文件
const uploadFileRequest = function(param){
	if(!hasNetwork()){//移到页面中判断：适配按钮状态变化的逻辑
		return;
	}
	var _self = this, 
		url = param.url || "",
		path = param.path || "",
		name = param.name || "file",
		data = param.data || {},
		token = "";
		
	if(url == ""){
		url =  _self.getUploadFileUrl();//默认的上传文件地址
	}else{
		url = baseUrl + "/" + url;
	}
	
	if(!data.token){
		token = uni.getStorageSync(sessionKey);
		// console.log("当前token:" + token);
		if(!token){
			uni.redirectTo({url:'/pages/login/login'});
			return;
		}else{
			data.token = token;
		}
	}
	var timestamp = Date.parse(new Date());//时间戳
	data["timestamp"] = timestamp;
	data["device"] = "APP";
	data["version"] = "V1.0.0";
	
	// console.log("网络请求start：url:" + url + "，params:" +JSON.stringify(data));
	uni.uploadFile({ 
		url: url, 
		filePath: path,
		name: name,
		formData: data,
		success: (res) => {
			// console.log("网络请求success-res:" + JSON.stringify(res));//json对象转json字符串
			// console.log("网络请求success-statusCode:" + res.statusCode);
			// console.log("uniapp上传文件api返回的data是字符串类型:" + res.data);
			if (res.statusCode && res.statusCode != 200) {//api错误(Error StatusCode)
				uni.showToast({
					/* title:res.errMsg */
					title:"api错误",
					icon:'none'
				});
				
				return;
			}
			var dataString = res.data;//json字符串
			var res = JSON.parse(dataString);//json字符串转json对象
			if (res.code) {
				if (res.code != "0") {//Error ResultCode
					uni.showToast({
						title:res.msg,
						icon:'none'
					});
					
					return;
				}
			} else {//No ResultCode
				uni.showToast({
					/* title:res.msg */
					title:"无结果码",
					icon:'none'
				});
				
				return;
			}
			typeof param.success == "function" && param.success(res);
		},
		fail: (e) => {
			// console.log("网络请求fail");
			uni.showToast({
				/* title: e.errMsg */
				title:"请检查网络",
				icon:'none'
			});
			typeof param.fail == "function" && param.fail(e.data);
		},
		complete: () => {
			// console.log("网络请求complete");
			typeof param.complete == "function" && param.complete();
			return;
		}
	});
}

//token
const getSession = function(){
	return uni.getStorageSync(sessionKey);
}
const setSession = function(session){
	uni.setStorageSync(sessionKey,session);
}
const clearSession = function(){
	uni.removeStorageSync(sessionKey);
}

//封装除登录外的业务网络请求:Promise是ES6中最重要的特性之一
const HttpRequest = (options, callback) => {
	options.data.token = uni.getStorageSync(sessionKey)
	options.data.device = 'APP'
	options.data.version = 'V2.0.0'
	options.data.timestamp = Date.parse(new Date())
	return new Promise((resolve, reject) => {
		uni.showLoading({
				mask: true,
				title: '加载中...'
			}),
			uni.request({
				method: options.method,
				header: {
					'content-type': "application/x-www-form-urlencoded"
				},
				url: `${ baseUrl }/${ options.url }`,
				data: options.data,
				timeout: 1000,
				success: (res) => {
					if (res.code === '-1') {
						uni.showLoading({
							mask: true,
							title: res.msg
						})
						uni.redirectTo({
							url: '/pages/login/login.vue'
						})
					} else if (res.code === '1') {
						uni.showLoading({
							mask: true,
							title: res.msg
						})
					} else if (res.code === {}) {
						uni.showLoading({
							mask: true,
							title: '无数据'
						})
					} else {
						resolve(res.data)
					}
				},
				fail: (err) => {
					if (!!err) {
						uni.showLoading({
							mask: true,
							title: err
						})
					}
				},
				complete: () => {
					uni.hideLoading()
				}
			})
	})
}

export default {
	baseUrl,
	hasNetwork,
	sendLoginOrRegisterRequest,
	sendRequest,
	uploadFileRequest,
	HttpRequest,
	getSession,
	setSession,
	clearSession
}

```
2. main.js中全局引入（可跳过，在调用界面引入即可）
```
import Vue from 'vue'
import App from './App'
import Http from './common/http.js'

Vue.config.productionTip = false
Vue.prototype.Http = Http 


App.mpType = 'app'

const app = new Vue({
		Http,
    ...App
})
app.$mount()

```
3. index.vue中调用
```
<template>
	<view class="container">
		<button :disabled="logining" @click="login()">登录测试示例</button>
		<button @click="getNum()">除登录外的业务网络请求示例1</button>
		<button @click="getList()">除登录外的业务网络请求示例2</button>
	</view>
</template>

<script>
// import Http from '../../common/http.js'
var _self;
export default {
	data() {
		return {
			logining: false,
			mobile:"15345678903",
			password:"66666666",
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
		getList:function() {
			const obj = {
				method: 'POST',
				url: 'machine/index',
				data: {
					token: true,
					keyword:''
				}
			}
			this.Http.HttpRequest(obj).then(res => {
				console.log(JSON.stringify(res))
				uni.showToast({
					title: "success",
					icon:'none'
				});
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


```



