//This is a consolidated and partially-redacted sample from the implementation of a multi-channel media player.
//This came from the channel-changer, such that clicking on one of a group of elements of CSS class "opcion" would summon the associated channel information
//ChannelId and ajax_channel_url are globals

jQuery(document).ready(function(){
		
		armChannelChanger();
	
});

function armChannelChanger()
{
	//this causes a click to start things up
	jQuery('#newChannelsControl .opcion').on('click',function()
	{		
		startChannelChange(jQuery(this));
	});
}

function startChannelChange(clickee){

if(clickee.hasClass('selected')||clickee.hasClass('toload'))
{
	return;
}

/*
 do an AJAX call to 
 -confirm the intended channel still exists
 -redraw #newChannelsControl
 -if existence of new channel confirmed. do the rest of here in a callback
 -if not, see if prior channel still exists, if not, use the "last resort" default as arg to setChannel();
 */
 channelMojo(clickee.attr('data-value'),function(newChannelId) 
 {
	//change the visual selection
	jQuery('#newChannelsControl .opcion.toload').removeClass('toload');
	jQuery('#newChannelsControl .opcion.selected').removeClass('selected');
	setChannel(newChannelId);
	 armChannelChanger();
 });
 
	
}

function channelMojo(newChannelId,callback){
	//at last, the actual AJAX call 
	jQuery.ajax({
		method: "POST",
		url:ajax_channel_url, //it's a global
		data:{
			command:"frontend_change_channels",
			desired_channel:newChannelId,
			current_channel:ChannelId,
			tz_offset:((new Date().getTimezoneOffset())/60)
		}
	}).done(function( data, textStatus, jqXHR ) {
		//At the time, pretty much anything could have come back from the call, including a caught exception or out-of-memory notice
		//This is why the response is sent to the browser as raw text instead of proper JSON
		var mess=data.indexOf('ok:');
		if(mess>-1) {
			var otherend=data.indexOf('/fetchAll');
			//between "ok:" and "/fetchAll" IS proper JSON
			var results=JSON.parse(data.substring(mess+3,otherend));
			//update the list of channels
			jQuery('#newChannelsControl').html(results.html_list);
			//and act on the channel we actually got
			callback(results.actual_channel);
		}
		else
		{
			var goods=data.indexOf('error:');
			var endpt;
			if(goods==-1)
			{
				//something REALLY bad happened, so try to get PHP's crash notice
				goods=data.indexOf('error');
				endpt=data.indexOf(":",goods+5);
				goods=endpt;
				endpt=data.indexOf("\n",goods+2);
			}
			else
			{
				endpt=data.indexOf("\n",goods+6);
			}
			
			callback(newChannelId);
		}
	})
	.fail(function( jqXHR, textStatus, errorThrown ) {
		alert("Getting channel list didn't work:"+textStatus+";"+errorThrown);
	});	
}

function setChannel(id){
	ChannelId=id;
	jQuery.cookie("channelId",id,{ path: '/' }); //TODO:path will be a collective "/admin/"
	jQuery('#channelsControl').val(ChannelId);
	
	jQuery('#newChannelsControl .opcion[data-value='+ChannelId+']').addClass('toload');
	if(typeof(channelChanged) == "function")
	{
		channelChanged(id);
	}
	return false;
}

function getChannel(){
	return jQuery.cookie("channelId"); 
}
