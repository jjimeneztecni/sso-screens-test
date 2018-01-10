

  var idLogin = '';
  var MAIL_EXISTS = false;
  var checkPolicies = false;

  function _init() {
	  
    gigya.showDebugUI();
    
    //$(document).on('click', 'div.gigya-composite-control.gigya-composite-control-checkbox', function() {    	
    $(document).on('click', '.gigya-label-text.gigya-checkbox-text', function() {
		$('#myModal-content').load("http://localhost:8081/legal");	
		
		// Get the modal
		var modal = document.getElementById('myModal');		
        modal.style.display = "block";	

        // Get the <span> element that closes the modal
        var span = document.getElementsByClassName("close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function() {
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    });      
    
    $(document).on('change', '.gigya-input-checkbox', function(e) {
    	loginScreenValidation();
    });    
    $(document).on('keyup', '.gigya-input-password', function(e) {
    	loginScreenValidation();
    });    

    
    
    $.ajax({
        url: "http://localhost:8081/myAccount/hasPolicies",
        xhrFields: {
            withCredentials: true
        },    
        data: { email: 'sdfsdf@sdfsd.com'},        
        statusCode: {
            401:function() {
            	checkPolicies = true;            	
            },
            200:function(data) {  
            	checkPolicies = (data != 'true');            	
            	//checkPolicies = data;
            }
        }        
    });  
    
    
    /* Actions associated to events */
    gigya.accounts.addEventHandlers({
        onLogin:refreshState,
       }
    );  
    
    refreshState();    
    
  }   

function refreshState(e){
    gigya.accounts.getAccountInfo({callback:function(event) {
        if (event.errorCode === 0) {
        	if(urlParam("ic_source")=="ecommerce"){
        		location.href = urlParam('ic_redirect');
        	}else{
	    		var data = event['data'];        	
	    		var GR = data['GR'];
	    		var DQ = data['DQ']; 
	    		
	    		// Depend on the previous variables (GR and terms) redirect to one place or another
	    		if(GR == "" || GR == null){ 	    			
	        		//location.href = "http://localhost:4200/#/acceso/registro?UID=" + encodeURIComponent(event.UID) + "&UIDSignature="
                    //+ encodeURIComponent(event.UIDSignature) + "&signatureTimestamp=" + event.signatureTimestamp + "&email=" + idLogin + "&ic_redirect=" + urlParam('ic_redirect');	        		
	        		location.href = "http://localhost:8081/validateSignature?UID=" + encodeURIComponent(event.UID) + "&UIDSignature="
                    + encodeURIComponent(event.UIDSignature) + "&signatureTimestamp=" + event.signatureTimestamp + "&email=" + idLogin + "&ic_redirect=" + urlParam('ic_redirect');	        		
	    		}else{
	                gigya.accounts.getJWT({
	                	callback: function(response){
	                		document.cookie = "C4Gigya_session=" + response.id_token + "; path=/";
	                		document.cookie = "C4Gigya_GR=" + GR + "; path=/";
	                		
	            			if(DQ){
	            				location.href = "http://localhost:4200/#/area-privada/mis-datos?ic_redirect=" + urlParam('ic_redirect');	
	            			}else{
	            				location.href = "http://localhost:4200/#/acceso/datos-adicionales?ic_redirect=" + urlParam('ic_redirect');
	            			}
	                		
	                	},
	                    fields: 'data.GR,profile.email,data.DQ,data.terms',
	                    expiration: 1000,
	                });    			        		
	    			                
	    		}
        	}
        }
        else {
        	checkSource();        	
        }
    }});
}

function checkSource() {

	var source =urlParam("ic_source"); 
    if(source=="ecommerce"){
    	idLogin = urlParam("ic_email");
    	if(idLogin == "" || idLogin==null){
    		registrationWithRaaS();
    	}else{
	    	gigya.accounts.isAvailableLoginID(
	            {
	                loginID: idLogin,
	                callback: isEmail
	            }
	        );
    	}
    }else{
    	loginWithRaaS();
    }
}

function loginWithRaaS() {

    // Login screen
    gigya.accounts.showScreenSet({
        screenSet:'Carrefour-RegistrationLogin',
        startScreen:'gigya-login-screen-c4',        
        //startScreen:'gigya-login-screen',
        containerID: 'gigyaContaniner',
        onFieldChanged: onFieldChanged,        
        onBeforeSubmit: onBeforeSubmit,     
        onAfterScreenLoad: onAfterScreenLoad, 
    });

    return false;
}

function registrationWithRaaS() {

	// Registration screen
    gigya.accounts.showScreenSet({
         screenSet:'Carrefour-RegistrationLogin',
         startScreen:'gigya-register-screen-c4',
         containerID: 'gigyaContaniner',
         onAfterScreenLoad: onAfterScreenLoad,     
         onError: errorHandler,
     });    

    return false;
}


function errorHandler (event) {
	// If mail already exist but idLogin is available is a non verified user	
	if(event.response.info.response.validationErrors[0].errorCode == 400003 && !MAIL_EXISTS){
		// TODO -> Show screen "Email enviado con el correo electrónico pero no ha validado"
		verificationPendingRaaS();
	}
	console.log(response.response.info.response.validationErrors[0].errorCode);
	return false;
}

function verificationPendingRaaS() {

	// Registration screen
    gigya.accounts.showScreenSet({
         screenSet:'Default-RegistrationLogin',
         startScreen:'gigya-verification-pending-screen',
         containerID: 'gigyaContaniner',
     });    

    return false;
}		


function isEmail (response) {
    MAIL_EXISTS = response.isAvailable === false;
    if (MAIL_EXISTS) {
    	loginWithRaaS();
        return false;
    } else {
    	registrationWithRaaS();    
    }
}

function onBeforeSubmit (event) {

    console.log("On Field Event");
    console.log(event);

    if(event.screen === 'gigya-login-screen-c4'){
          
           idLogin = event.formData.loginID;
           if(!MAIL_EXISTS){
               // If email is available
               gigya.accounts.isAvailableLoginID(
                  {
                      loginID: idLogin,
                      callback: isUser
                  }
              );
                return false;               
           }else{
        	   // Validate input and let continue or do not nothing
        	   if(!loginScreenValidation()){
        		   return false;
        	   }
        	   
           }

       }


 }

// Validate the login screen
function loginScreenValidation (){
	   // Validate input and let continue or show an error
	   if( $(".gigya-input-checkbox").is(':checked') && $("input.gigya-input-password.gigya-valid").val().length > 5){
		   $('.gigya-input-submit').addClass('submit-ok');
		   return true;
	   }else{
		   $('.gigya-input-submit').removeClass('submit-ok');
		   return false;		   		   
	   }
}
// Check if user exist
function isUser (response) {
    MAIL_EXISTS = response.isAvailable === false;
    
    // If user exist show password field and policies if not signed
    if (MAIL_EXISTS) {
    	// TODO --> bloquear el campo del usuario
        var PASSWORD_FIELDS = document.body.querySelectorAll(".gigya-composite-control-password");
        // Show Password Field
        for (i = 0; i < PASSWORD_FIELDS.length; i++) {
            PASSWORD_FIELDS[i].classList.remove("hidden");
        }
    	if(checkPolicies){
	        var CHECK_FIELDS = document.body.querySelectorAll(".gigya-composite-control-checkbox");
	        // Show Password Field
	        for (i = 0; i < CHECK_FIELDS.length; i++) {
	        	CHECK_FIELDS[i].classList.remove("hiddenPolicies");
	        }
    		$('.gigya-input-submit').removeClass('submit-ok');	        
    	}        
        return false;
    } else {
    	   // Registration screen
    		registrationWithRaaS();
//           gigya.accounts.showScreenSet({
//                screenSet:'Carrefour-RegistrationLogin',
//                startScreen:'gigya-register-screen-c4',
//                containerID: 'gigyaContaniner',
//                onAfterScreenLoad: onAfterScreenLoad,        
//            });        
    }
}


// Button Functions
function onAfterScreenLoad (event) {
    if(event.currentScreen === 'gigya-register-screen-c4'){ 
        $('[name=email]').val(idLogin);
        $('.gigya-input-submit').removeClass('submit-ok');       
    }else if(event.currentScreen === 'gigya-login-screen-c4'){
    	$('[name=username]').val(idLogin);
    	if(idLogin != "" && idLogin!=null){
	        var PASSWORD_FIELDS = document.body.querySelectorAll(".gigya-composite-control-password");
	        // Show Password Field
	        for (i = 0; i < PASSWORD_FIELDS.length; i++) {
	            PASSWORD_FIELDS[i].classList.remove("hidden");
	        }
	        if(checkPolicies){
	        	$('.gigya-input-submit').removeClass('submit-ok');
    		}	
    	}
    }
}

// Button Functions
function onFieldChanged (event) {
    if(event.screen === 'gigya-login-screen-c4'){
      if(event.field === 'loginID'){
           if(isValidEmail(event.value)){
                $('.gigya-input-submit').addClass('submit-ok');
            }else{
                $('.gigya-input-submit').removeClass('submit-ok');
            }
      }          
    }
}

function isValidEmail(mail) { 
	return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(mail);
}

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


