
  function _init() {
	  logoutWithRaaS();        
  }   
  
  function logoutWithRaaS() {
	  	// Logout screen set
	    gigya.accounts.logout({ 
	  	    callback: redirect
	  	}
	    		);	    
	    return false;
	}  

  function redirect(response){
	  if (response.errorCode === 0) {       	
		  	// Redirect
		    document.cookie = "C4Gigya_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
		  	location.href = urlParam('origen');
      }
      else {
      	// Error        	
      }
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

