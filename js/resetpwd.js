

  var idLogin = '';
  var MAIL_EXISTS = false;

  function _init() {

	  gigya.showDebugUI();	  
	  resetPwd();    
    
  }   


_init();

function resetPwd() {

    // Login screen
    gigya.accounts.showScreenSet({
        screenSet:'Carrefour-RegistrationLogin',
        startScreen:'gigya-reset-password-screen',
        containerID: 'gigyaContaniner',        
    });

    return false;
}





