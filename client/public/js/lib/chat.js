/*FUNCINO PARA QUE EL CHAT SIMPRE ESTE AL 100% DEL ALTO*/
function resizeChat(){
    var winHeight = jQuery(window).height();
    jQuery('.well.well-large').css('height',winHeight-140 + 'px');
    var txtarea = jQuery('.container.trs').width();
    jQuery('.chatwrap .span12 input[type="text"]').css('width',txtarea-12 + 'px');
}
jQuery(window).ready(function() {resizeChat();});
jQuery(window).resize(function() {resizeChat();});
//Keep the chat scroll on the bottom
if($('.well.well-large').length === 0){}
else{
    var object = jQuery('.well.well-large').get();
    var string = object[0].innerHTML;
}
window.setInterval(function(){
    if($('.well.well-large').length === 0){}else
    {
        var objectNew = jQuery('.well.well-large').get();
        if(string != objectNew[0].innerHTML){
            jQuery('.well.well-large').scrollTop(jQuery('.well.well-large')[0].scrollHeight);
            string = objectNew[0].innerHTML;
        } 
    }
    
}, 100);
/* FIN 100% */

/*QUERY PARA EL DESPLIEGUE DEL PERFIL DEL USUARIO*/
var ctrl = 0;
jQuery('.icon.useri').click(function(){
  if(ctrl == 0){
      jQuery('.icon.useri').animate({'left': '50%'}, 'slow');
      jQuery('.user').animate({'width': '50%'}, 'slow');
      ctrl = 1;
  }
  else{
      jQuery('.icon.useri').animate({'left': '0%'}, 'slow');
      jQuery('.user').animate({'width': '0%'}, 'slow');
      ctrl = 0;
  }
});
/*FIN DESPLIEGUE USUERIO*/
/*QUERY PARA EL DESPLIEGUE DEL PERFIL DEL USUARIO*/
var ctrlP = 0;
jQuery('.icon.profilei').click(function(){
  if(ctrlP == 0){
      jQuery('.icon.profilei').animate({'right': '80%'}, 'slow');
      jQuery('.profile').animate({'width': '80%'}, 'slow');
      ctrlP = 1;
  }
  else{
      jQuery('.icon.profilei').animate({'right': '0%'}, 'slow');
      jQuery('.profile').animate({'width': '0%'}, 'slow');
      ctrlP = 0;
  }
});

//Autofill city name
$("#locationapi").geocomplete();
/*FIN DESPLIEGUE USUERIO*/
/*FOCUSOUT FORM SUBMIT*/

