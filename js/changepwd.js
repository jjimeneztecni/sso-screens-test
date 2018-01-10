
  function _init() {
    changePwd();        
  }   

  function changePwd(e){
  	// Change password screen
  	gigya.accounts.showScreenSet({
  	    screenSet:'Default-ProfileUpdate',
  	    startScreen:'gigya-change-password-screen',
  	    containerID: 'gigyaContaniner', 
  	    onHide: onHide
  	});
  };

  function onHide(e){
  	// Redirect
  	location.href = urlParam('origen');
  };

  function urlParam(name){
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
      if (results==null){
         return null;
      }
      else{
         return decodeURI(results[1]) || 0;
      }
  }


_init();

