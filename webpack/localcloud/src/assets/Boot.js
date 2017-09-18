/**
 * Created by lin on 17-9-1.
 *
 * 用于启动时执行
 *
 */
import Vue from './EventBus'
import axios from 'axios'
import * as RouterPath from './../constants/RouterPaths'
import * as API from './../constants/API'
import StorageService from './../service/Storage'

let storage = window.localStorage
export default {
    main: function (vue) {
        let that = this
        //主函数 推荐使用异步promise
        //获取机型和token
        try {
            if (device.platform){
                //添加到is_mobile中
                console.log(device)
            }
        } catch (e){
            Vue.GLOBAL.is_mobile = 0
        }

        //获取本机信息
        let device_info = Vue.GLOBAL.device_info

        // if (device.platform)
        //STEP1 从localstorage中获取该wifi下已远程IP和端口 暂略
        let remote_conn_config = StorageService.getRemoteConnConfig()
        if (false == remote_conn_config || 'object' != typeof(remote_conn_config)){
            //强制跳转
            this.showRemoteConfigPage(vue)
            return
        }
        //获取该ssid下的配置
        let tmp_conn_config = {}
        for (let i in remote_conn_config){
            if (remote_conn_config[i].ssid == device_info.ssid ){
                tmp_conn_config = remote_conn_config[i]
            }
        }
        if (undefined == tmp_conn_config.host){
            this.showRemoteConfigPage(vue)
            return
        }

        //STEP2 测试连接 暂略
        vue.$http.get(tmp_conn_config.proto + '://' + tmp_conn_config.host + ':' + tmp_conn_config.port + API.CONFIG_REMOTE_CONNECTION)
            .then((response) => {
                let ret = response.data
                if (ret['error_no'] != 0) {
                    if (ret['error_msg'] != ""){
                        that.showRemoteConfigPage(vue)
                        return
                    }
                    that.showRemoteConfigPage(vue)
                    return
                }

                //记录该连接方式下配置
                vue.GLOBAL.remote_proto = tmp_conn_config.proto
                vue.GLOBAL.remote_host  = tmp_conn_config.host
                vue.GLOBAL.remote_port  = tmp_conn_config.port

                vue.$http = axios.create({
                    baseURL: vue.GLOBAL.remote_proto + '://' + vue.GLOBAL.remote_host + ':' + vue.GLOBAL.remote_port + '/',
                    timeout: 5000,
                })
            })
            .catch(function (response) {
                console.log(response)
                that.showRemoteConfigPage(vue)
                return;
            })

        // StorageService.storageRemoteConnConfig([{
        //     wifi    :   '',
        //     ssid    :   '',
        //     token   :   '',
        //     proto   :   'http',
        //     host    :   '127.0.0.1',
        //     port    :   '9090',
        // }])


        //STEP3 如连接失败显示配置界面
        // this.showRemoteConfigPage(vue)
    },
    
    getRemoteHostPort: function () {
        
    },
    
    showRemoteConfigPage: function (vue) {
        Vue.$emit("showbottom", false)
        //调用原始this
        vue.$router.push({path: RouterPath.PAGES_CONFIG_REMOTE})
    }
}