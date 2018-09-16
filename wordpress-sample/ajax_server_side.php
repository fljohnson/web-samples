<?php
//This sample is the server side of the "channel changer" described in ajax_client_side.js
function gf_channel_change_frontend()
{
	//return either the desired channel or the current channel in one field, 
	//and the HTML for the list of channels in another field
	$args = array(
	  'numberposts' => 1,
	'post_type' => 'channel',
	'p'=>$_REQUEST['desired_channel']
	);
	$actual_channel=-1;
	if(count(get_posts($args))>0)
	{
		$actual_channel=$args['p'];
	}
	else
	{
		$args['p']=$_REQUEST['current_channel'];
		if(count(get_posts($args))>0)
		{
			$actual_channel=$args['p'];
		}
	}
	//the do_shortcode() call gets the HTML for the list of viable channels by name and ID
	$mess=array(
	'actual_channel'=>$actual_channel,
	'html_list'=> do_shortcode('[gf_channel_select box=1]')
	);
	$rv="ok:".json_encode($mess)."/fetchAll";

	return $rv;
}

//handles the AJAX request. 
//with the ajax_client.js shown, $_REQUEST['command'] was 'frontend_change_channels'
//which meant that gf_channel_change_frontend is called
function gf_channel_func()
{
	global $hours_offset;
	
	$commands=['create','list','update','delete_channel','delete_category','fetch_single', 'create_category','update_category','rearrange_channels','frontend_change_channels'];
	$ord=array_search($_REQUEST['command'],$commands);
	if($ord===FALSE)
	{
		$ord=-1;
	}	
	else
	{
		if(!empty($_REQUEST['tz_offset']))
		{
			$hours_offset=$_REQUEST['tz_offset'];
		}
	}
	switch($ord)
	{
		case 0:
			$rv=gf_channel_create();
			break;
		case 1:
			$rv=gf_channel_fetchAll();
			break;
		case 2:
			$rv=gf_channel_create();
			break;
		case 3:
			$rv=gf_channel_delete();
			break;
		case 4:
			$rv=gf_category_delete();
			break;
	/*	case 5:
			$rv=gf_get_current_playable(false);
			break;*/
		case 6:
			$rv=gf_category_create();
			break;
		case 7:
			$rv=gf_category_create();
			break;
		case 8:
			$rv=gf_channel_rearrange();
			break;
		case 9:
			$rv=gf_channel_change_frontend();
			break;
		default:
		$rv="error: channel-ajax:no such command as '".$_POST['command']."'";
	}
	return $rv;
?>
