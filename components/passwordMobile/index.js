const app = getApp();
Component({
  props: { // 组件传参默认值
    className: '', // 父级加入className
    verifyCodeLength: 6, // 验证码长度
    mobile: '', // 父传的手机号
    yzm: '',//图形验证码
    numberCode: true, // 是否是是数字键盘
    codeTime: 60, // 倒计时时间
    disabled: false, // 手机号是否可以编辑
    onSendCode: () => { }, // 点击发送验证码
    onCodeInput: () => { }, // 输入验证码事件
    notimer:false,
    yzmId:''
  },
  data: {
    version: '1.0.0', // 组件版本信息
    btnName: '发送验证码', // 按钮显示名称
    canSend: true, // 是否可以发送验证吗
    hasSend: false, // 是否已经发送
    popoverShow: false, // 弹窗
    mobileValue: '', // 组件手机号的值
    mobileSafe: '', // 脱敏后的值
    txt: '', // 文本赋值
    mobileDisabled: false, // 手机号是否禁止输入
    position: 'bottomRight', // 弹窗位置
    isforget: '1',
  },
  didMount() {
    const {
      mobile,
      disabled
    } = this.props;
    let flag = mobile && this.verifyTel(mobile);
    this.setData({
      mobileValue: mobile,
      mobileDisabled: disabled,
      canSend: flag
    });
    console.log('载入mobileCode组件:' + this.data.version);
  },
  didUpdate(prevProps) {
    const {
      mobile,
      disabled
    } = prevProps;
    const {
      mobileValue
    } = this.data;

    if (mobile !== this.props.mobile && this.props.mobile !== mobileValue) {
      let flag = this.props.mobile && this.verifyTel(this.props.mobile);
      this.setData({
        mobileValue: this.props.mobile,
        canSend: flag
      });
    }
    if (disabled !== this.props.disabled) {
      this.setData({
        mobileDisabled: this.props.disabled
      });
    }
  },
  methods: {
    /**
     * 点击清楚手机号
     * @method onMobileClear
     */
    onMobileClear() {
      this.setData({
        mobileValue: '',
        mobileSafe: '',
        canSend: false,
        hasSend: false,
        btnName: '发送验证码'
      });
    },
    /**
     * 点击获取验证码触发
     * @method onSendCode
     */
    onSendCode() {
      const that = this;
      var yzm = this.props.yzm;
      console.info("mobileData-----------------------------------------------:");
      console.info(that.data);
      console.info(that.props);
      if(that.data.mobileValue.length==0){
           my.showToast({
            type: 'none',
            content: '请输入手机号',
            duration: 2000,
            success: () => {
          }
        });
        return;
      }
      if(yzm==''){
        my.showToast({
          type: 'none',
          content: '请输入图形验证码',
          duration: 2000,
          success: () => {
          }
        });
      }else if(yzm!=''){
        my.request({
          url: app.globalData.webServerUrl+'alipayRestController.do?method=checkTYzm',//校验验证码
          method: 'POST',
          data: {
            verifyCheckCode:yzm,
            userId:app.globalData.verifyCode,
            phone:that.data.mobileValue
          },
          // 期望返回的数据格式，默认json，支持json，text，base64
          dataType: 'json',
          // 调用成功的回调函数
          success: function (res) {
            if(res.data.code=='000000') {
              // if (that.data.canSend) {
              //   const {
              //     mobileValue
              //   } = that.data;  
              // } else {
              //   const {
              //     popoverShow,
              //     hasSend
              //   } = that.data;
              //   if (!hasSend && !popoverShow) {
              //     that.showPopover();
              //   }
              // }
              that.gotoSend();
            }else if(res.data.code=='999999'){
              my.showToast({
                type: 'fail',
                content: res.data.message,
                duration: 3000,
                success: () => { },
              });
            }
          },
          fail: function (res) {
            my.showToast({
              type: 'exception',
              content: '网络异常',
              duration: 3000,
              success: () => { },
            });
          }
        });
      }
    },
    gotoSend(){
      const that = this;
      my.request({
        url: app.globalData.webServerUrl+'alipayRestController.do?method=yzmRegist',
        method: 'POST',
        data: {
          phone:that.data.mobileValue,
          isforget:1
        },
        // 期望返回的数据格式，默认json，支持json，text，base64
        dataType: 'json',
        // 调用成功的回调函数
        success: function (res) {
          if(res.data.code=='999999'){
            my.showToast({
              type: 'success',
              title: '温馨提示',
              content: '手机号: 验证码发送失败',
              duration: 2000,
              success: () => {
              }
            });
          }else if(res.data.code=='888888'){
              my.showToast({
              type: 'success',
              title: '温馨提示',
              content: '手机号不存在',
              duration: 2000,
              success: () => {
              }
            });
              that.setData({notimer:true});
          }else if(res.data.code=='000000'){
            my.showToast({
              type: 'none',
              content: '验证码发送成功',
              duration: 1500,
              success: () => {
              const {
                  mobileValue
                } = that.data;
                that.settimer();
                const pat = /(\d{3})\d*(\d{4})/;
                let str = mobileValue.replace(pat, '$1***$2');
                that.props.onSendCode({
                  mobile: mobileValue,
                    yzmId: res.data.yzmId
                });
                that.setData({
                  mobileSafe: str,
                  hasSend: true,
                  txt: '已',
                  mobileDisabled: true,
                  canSend: false
                });
              }
            });
          }
        },
        fail: function () {
          my.showToast({
            type: 'exception',
            content: '网络异常',
            duration: 3000,
            success: () => {
            },
          });
        }
      });
    },
    /**
     * 输入验证码触发事件并传给父
     * @method onCodeInput
     * @param {*} e
     */
    onCodeInput(e) {
      this.props.onCodeInput && this.props.onCodeInput(e);
    },
    /**
     * 正则校验 获取值 改变
     * @method onMobileInput
     * @param {*} e
     */
    onMobileInput(e) {
      const that = this;
      const {
        value
      } = e.detail;
      const result = this.verifyTel(value);
      if (result) { // 11位数字  
         this.setData({
          mobileValue: value,
          canSend: true,
          btnName: '发送验证码'
        });
       console.info(this.data.mobileValue+','+this.data.canSend)
      } else {
        this.setData({
          canSend: false,
          btnName: '发送验证码'
        });
      }
    },
    /**
     * 弹窗去抖（3秒后弹窗强制消失）
     * @method showPopover
     */
    showPopover() {
      this.setData({
        popoverShow: true
      }, () => {
        setTimeout(() => {
          this.setData({
            popoverShow: false
          });
        }, 3000);
      });
    },
    /**
     * 倒计时定时器
     * @method settimer
     */
    settimer() {
      let timer;
      let codeTime = this.props.codeTime;
      const disabled= this.props;
      clearInterval(timer);
      timer = setInterval(() => {
        codeTime--;
        this.setData({
          btnName: `倒计时${codeTime}秒`
        });
        if (codeTime === 0) {
          clearInterval(timer);
          const box = this.data.othervalue;
          this.setData({
            btnName: '重新发送',
            mobileDisabled: disabled ? true : false,
            canSend: true,
            txt: ''
          });
        }
      }, 1000);
    },
    /**
     * 检验手机号是否正确
     * @method verifyTel
     * @param {*} number // 手机号
     */
    verifyTel(number) { // 手机号正则校验
      const reg = /^1[3|4|5|7|8|9]\d{9}$/;
      return reg.test(number);
    }
  }
});