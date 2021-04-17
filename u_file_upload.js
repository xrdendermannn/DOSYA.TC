var Dosyatc={
	seconds:0,
	minutes:0,
	hours:0,
	start_time:0,
	upload_id:null,
	total_upload_size:0,
	total_kbytes:0,
	toggle_upload_stats:0,
	file_label_highlight_on:'#FFFFE0',
	file_label_highlight_off:'#F9F9F9',
	CPB_loop:false,
	CPB_width:0,
	CPB_bytes:0,
	CPB_time_width:500,
	CPB_time_bytes:15,
	CPB_hold:true,
	CPB_byte_timer:null,
	CPB_status_timer:null,
	BPB_width_inc:0,
	BPB_width_new:0,
	BPB_width_old:0,
	BPB_timer:null,
	UP_timer:null,
	progress_data:null,
	path_to_link_script:null,
	path_to_set_progress_script:null,
	path_to_get_progress_script:null,
	path_to_upload_script:null,
	check_allow_extensions_on_client:null,
	check_disallow_extensions_on_client:null,
	allow_extensions:null,
	disallow_extensions:null,
	check_file_name_format:null,
	check_file_name_regex:null,
	check_file_name_error_message:null,
	max_file_name_chars:null,
	min_file_name_chars:null,
	check_null_file_count:null,
	check_duplicate_file_count:null,
	max_upload_slots:null,
	cedric_progress_bar:null,
	cedric_hold_to_sync:null,
	bucket_progress_bar:null,
	progress_bar_width:null,
	block_ui_enabled:null,
	show_percent_complete:null,
	show_files_uploaded:null,
	show_current_position:null,
	show_current_file:null,
	show_elapsed_time:null,
	show_est_time_left:null,
	show_est_speed:null,

	getFileName:function(slot_value){
		var index_of_last_slash = slot_value.lastIndexOf("\\");

		if(index_of_last_slash < 1){ index_of_last_slash = slot_value.lastIndexOf("/"); }

		var file_name = slot_value.slice(index_of_last_slash + 1, slot_value.length);

		return file_name;
	},

	getFileExtension:function(slot_value){
		var file_extension = slot_value.substring(slot_value.lastIndexOf(".") + 1, slot_value.length).toLowerCase();

		return file_extension;
	},

	highlightFileLabel:function(file_label, color){ JQ("#" + file_label).css({background:color}); },

	clearFileLabels:function(){
		JQ("#u_upload_form").find(":file").each(function(){
			Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_off);
		});
	},

	// Check the file format before uploading
	checkFileNameFormat:function(){
		if(!Dosyatc.check_file_name_format){ return false; }

		var found_error = false;

		JQ("#u_upload_form").find(":file").each(function(){
			if(JQ(this).val() !== ""){
				var file_name = Dosyatc.getFileName(JQ(this).val());

				if(file_name.length > Dosyatc.max_file_name_chars){
					Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_on);
					Dosyatc.showAlert("Hata, dosya adý çok uzun " + Dosyatc.max_file_name_chars + " characters.", 500, 85, Dosyatc.block_ui_enabled);
					found_error = true;
				}

				if(file_name.length < Dosyatc.min_file_name_chars){
					Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_on);
					Dosyatc.showAlert("Hata, dosya adý çok kýsa " + Dosyatc.min_file_name_chars + " characters.", 500, 85, Dosyatc.block_ui_enabled);
					found_error = true;
				}

				if(!Dosyatc.check_file_name_regex.test(file_name)){
					Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_on);
					Dosyatc.showAlert(Dosyatc.check_file_name_error_message, 500, 85, Dosyatc.block_ui_enabled);
					found_error = true;
				}
			}
		});

		return found_error;
	},

	// Check for legal file extentions
	checkAllowFileExtensions:function(){
		if(!Dosyatc.check_allow_extensions_on_client){ return false; }

		var found_error = false;

		JQ("#u_upload_form").find(":file").each(function(){
			if(JQ(this).val() !== ""){
				var file_extension = Dosyatc.getFileExtension(Dosyatc.getFileName(JQ(this).val()));

				if(!file_extension.match(Dosyatc.allow_extensions)){
					Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_on);
					Dosyatc.showAlert('"' + file_extension + '" dosya uzantýsýný yüklemek yasak. Rar veya zip içinde yükleyebilirsiniz.', 500, 85, Dosyatc.block_ui_enabled);
					found_error = true;
				}
			}
		});

		return found_error;
	},

	// Check for illegal file extentions
	checkDisallowFileExtensions:function(){
		if(!Dosyatc.check_disallow_extensions_on_client){ return false; }

		var found_error = false;

		JQ("#u_upload_form").find(":file").each(function(){
			if(JQ(this).val() !== ""){
				var file_extension = Dosyatc.getFileExtension(Dosyatc.getFileName(JQ(this).val()));

				if(file_extension.match(Dosyatc.disallow_extensions)){
					Dosyatc.highlightFileLabel(JQ(this).attr("id") + "_label", Dosyatc.file_label_highlight_on);
					Dosyatc.showAlert('Bu dosya uzantýsý "' + file_extension + '" yasak. Rar veya zip içinde yükleyebilirsiniz.', 500, 85, Dosyatc.block_ui_enabled);
					found_error = true;
				}
			}
		});

		return found_error;
	},

	// Make sure the user selected at least one file
	checkNullFileCount:function(){
		if(!Dosyatc.check_null_file_count){ return false; }

		var found_file = false;

		JQ("#u_upload_form").find(':file').each(function(){
			if(JQ(this).val() !== ""){ found_file = true; }
		});

		if(!found_file){
			Dosyatc.showAlert("Yüklemek için dosya seçmediniz.", 400, 80, Dosyatc.block_ui_enabled);
			return true;
		}
		else{ return false; }
	},

	// Make sure the user is not uploading duplicate files
	checkDuplicateFileCount:function(){
		if(!Dosyatc.check_duplicate_file_count){ return false; }

		var found_duplicate = false;
		var file_count = 0;
		var file_name_array = [];

		JQ("#u_upload_form").find(":file").each(function(){
			if(JQ(this).val() !== ""){
				var obj = {};
				obj.file_name = Dosyatc.getFileName(JQ(this).val());
				obj.label_name = JQ(this).attr("id") + "_label";
				file_name_array[file_count] = obj;
				file_count++;
			}
		});

		for(var i = 0; i < file_name_array.length; i++){
			var obj_1 = file_name_array[i];

			for(var j = 0; j < file_name_array.length; j++){
				var obj_2 = file_name_array[j];

				if(obj_1.file_name === obj_2.file_name && obj_1.label_name !== obj_2.label_name){
					found_duplicate = true;
					Dosyatc.highlightFileLabel(obj_1.label_name, Dosyatc.file_label_highlight_on);
					Dosyatc.highlightFileLabel(obj_2.label_name, Dosyatc.file_label_highlight_on);
				}
			}
		}

		if(found_duplicate){
			Dosyatc.showAlert("Ayný dosyalar seçili.", 400, 80, Dosyatc.block_ui_enabled);
			return true;
		}
		else{ return false; }
	},

	showAlert:function(alert_message, alert_width, alert_height, block_ui_enabled){
		if(!block_ui_enabled){ alert(alert_message); }
		else{
			alert_message = "<br>" + alert_message + "<br><br><input style='width:75px;' type='button' id='ok_btn' name='ok' value='OK' onClick='JQ.unblockUI();'>";

			JQ.blockUI({
				message:alert_message,
				css:{
					width:alert_width+'px',
					height:alert_height+'px',
					top:(JQ(window).height() / 3) - (alert_height / 2) + 'px',
					left:(JQ(window).width() / 2) - (alert_width / 2) + 'px',
					textAlign:'center',
					cursor:'default',
					backgroundColor:'#f2f2f2',
					borderColor:'#f2f2f2',
					color:'black',
					font:'14px Arial',
					fontWeight:'bold',
					padding:'2px',
					opacity:'1',
					'-webkit-border-radius':'2px',
					'-moz-border-radius':'2px'
				},
				overlayCSS:{
					cursor:'default',
					applyPlatformOpacityRules:true
				}
			});
		}
	},

	showCGIOutput:function(CGI_message, reset_page){
		Dosyatc.showAlert(CGI_message, 400, 80, Dosyatc.block_ui_enabled);
		if(reset_page){ Dosyatc.resetFileUploadPage(); }
	},

	showDebugMessage:function(message){ JQ("#u_debug").append(message + "<br>"); },

	showAlertMessage:function(message){ JQ("#u_alert").html(message); },

	redirectAfterUpload:function(redirect_url, embedded_upload_results){
		redirect_url = decodeURIComponent(redirect_url);

		if(embedded_upload_results){
			JQ('#upload_container').load(redirect_url);
			Dosyatc.showEmbeddedUploadResults();
		}
		else{ self.location.href = redirect_url; }
	},

	showEmbeddedUploadResults:function(){
		Dosyatc.stopDataLoop();
		Dosyatc.resetProgressBar();

		JQ("#u_alert").html("");
		JQ("#upload_container").show();
		JQ("#reset_button").val("Reset");
		JQ(".upfile_ultimo").remove();
		JQ(".upfile").remove();
		JQ(".upfile_label").remove();
		JQ("#upload_button").show();
		JQ("#upload_slots_container").hide();

		Dosyatc.addUploadSlot();
	},

	stopDataLoop:function(){
		Dosyatc.CPB_loop = false;
		clearInterval(Dosyatc.UP_timer);
		clearInterval(Dosyatc.BPB_timer);

		if(Dosyatc.cedric_progress_bar){
			if(Dosyatc.show_current_position){ clearTimeout(Dosyatc.CPB_byte_timer); }
			clearTimeout(Dosyatc.CPB_status_timer);
		}
	},

	// Reset the progress bar
	resetProgressBar:function(){
		JQ("#progress_bar_container").hide();
		JQ("#upload_stats_container").hide();

		Dosyatc.seconds = 0;
		Dosyatc.minutes = 0;
		Dosyatc.hours = 0;
		Dosyatc.start_time = 0;
		Dosyatc.upload_id = '';
		Dosyatc.progress_data = '';
		Dosyatc.total_upload_size = 0;
		Dosyatc.total_kbytes = 0;
		Dosyatc.toggle_upload_stats = 0;
		Dosyatc.CPB_loop = false;
		Dosyatc.CPB_width = 0;
		Dosyatc.CPB_bytes = 0;
		Dosyatc.CPB_hold = true;
		Dosyatc.BPB_width_inc = 0;
		Dosyatc.BPB_width_new = 0;
		Dosyatc.BPB_width_old = 0;

		JQ("#progress_bar").css("width", "0px");

		if(Dosyatc.show_files_uploaded || Dosyatc.show_current_position || Dosyatc.show_elapsed_time || Dosyatc.show_est_time_left || Dosyatc.show_est_speed){
			JQ("#upload_stats_toggle").html("[+]");
			//JQ("#upload_stats_toggle").css({ backgroundImage : "url(./images/toggle.png)" });
		}

		if(Dosyatc.show_percent_complete){ JQ("#percent_complete").html("0%"); }
		if(Dosyatc.show_files_uploaded){ JQ("#files_uploaded").html("0"); }
		if(Dosyatc.show_files_uploaded){ JQ("#total_uploads").html("0"); }
		if(Dosyatc.show_current_position){ JQ("#current_position").html("0"); }
		if(Dosyatc.show_current_position){ JQ("#total_kbytes").html("0"); }
		if(Dosyatc.show_elapsed_time){ JQ("#elapsed_time").html("00:00:00"); }
		if(Dosyatc.show_est_time_left){ JQ("#est_time_left").html("00:00:00"); }
		if(Dosyatc.show_est_speed){ JQ("#est_speed").html("0"); }
	},

	resetUploadDiv:function(){
		JQ("#upload_container").hide();
		JQ("#upload_container").html("");
	},

	// Initialize the file upload page
	resetFileUploadPage:function(){
		Dosyatc.stopDataLoop();
		Dosyatc.resetProgressBar();
		Dosyatc.resetUploadDiv();

		JQ("#u_alert").html("");
		JQ("#reset_button").val("Reset");
		JQ(".upfile_ultimo").remove();
		JQ(".upfile").remove();
		JQ(".upfile_label").remove();
		JQ("#upload_button").show();
		JQ("#upload_slots_container").hide();
		JQ("#upload_form_values_container").show();

		Dosyatc.addUploadSlot();
	},

	// Link the upload
	linkUpload:function(){
		if(Dosyatc.check_file_name_format || Dosyatc.check_allow_extensions_on_client || Dosyatc.check_disallow_extensions_on_client || Dosyatc.check_duplicate_file_count){ Dosyatc.clearFileLabels(); }
		if(Dosyatc.checkFileNameFormat()){ return false; }
		if(Dosyatc.checkAllowFileExtensions()){ return false; }
		if(Dosyatc.checkDisallowFileExtensions()){ return false; }
		if(Dosyatc.checkNullFileCount()){ return false; }
		if(Dosyatc.checkDuplicateFileCount()){ return false; }

		JQ("#upload_button").hide();

		if(Dosyatc.show_files_uploaded){ JQ("#total_uploads").html(JQ(".upfile").length - 1); }

		var form_data = JQ("#u_upload_form").serialize();
		var file_data = Dosyatc.serializeFileNames();
		var data = form_data + "&" + file_data;

		JQ.post(Dosyatc.path_to_link_script, data, function(){}, "script");

		return false;
	},

	// Add upload file names to serialized data
	// Based on jQuery.serializeAnything by Bramus! (Bram Van Damme)
	serializeFileNames:function(){
		var toReturn = [];

		JQ("#u_upload_form").find(":file").each(function(){
			if(JQ(this).val() !== ""){
				var file_name = Dosyatc.getFileName(JQ(this).val());
				toReturn.push("upload_file[]" + "=" + encodeURIComponent(file_name));
			}
		});

		return toReturn.join("&").replace(/%20/g, "+");
	},

	// Initialize progress bar
	initializeProgressBar:function(upload_id, debug_ajax){
		if(debug_ajax){ Dosyatc.showDebugMessage("Dosya Yükleniyor: " + Dosyatc.path_to_set_progress_script + '?upload_id=' + upload_id); }

		var data = "upload_id=" + upload_id;

		JQ.get(Dosyatc.path_to_set_progress_script, data, function(){}, "script");
	},

	//Submit the upload form
	startUpload:function(upload_id, debug_upload, debug_ajax){
		Dosyatc.resetUploadDiv();

		var iframe_name = "upload_iframe_" + upload_id;

		if(debug_ajax){ Dosyatc.showDebugMessage("Submitting Upload: "+Dosyatc.path_to_upload_script+"?upload_id=" + upload_id); }

		JQ("#upload_container").html("<iframe name='"+iframe_name+"' frameborder='0' width='780' height='200' scrolling='auto'></iframe>");
		JQ("#u_upload_form").attr("target", iframe_name);
		JQ("#u_upload_form").attr("action", Dosyatc.path_to_upload_script + "?upload_id=" + upload_id);
		JQ("#upload_slots_container").fadeOut("fast");
		JQ("#upload_form_values_container").fadeOut("fast");
		JQ(".upfile_ultimo").fadeOut("fast");
		JQ("#u_upload_form").submit();
		JQ("#reset_button").val("Yükleme Ýptal");

		if(!debug_upload){ Dosyatc.initializeProgressBar(upload_id, debug_ajax); }
		else{ Dosyatc.showAlertMessage("Debug Uploader Detected, Please Wait..."); }
	},

	// Stop the upload
	stopUpload:function(){
		try{ document.execCommand("Stop"); }
		catch(e){}
		try{ window.stop(); }
		catch(e){}

		JQ("#upload_slots_container").fadeIn("fast");
		JQ("#upload_form_values_container").fadeIn("fast");
		JQ("#upload_button").show();
		JQ("#reset_button").val("Reset");
	},

	// Get the progress of the upload
	getProgressStatus:function(){
		if(Dosyatc.CPB_loop){
			JQ.get(Dosyatc.path_to_get_progress_script, Dosyatc.progress_data, function(){}, "script");
		}
	},

	// Make the progress bar smooth
	smoothCedricStatus:function(){
		if(Dosyatc.CPB_width < Dosyatc.progress_bar_width && !Dosyatc.CPB_hold){
			Dosyatc.CPB_width++;
			JQ("#progress_bar").css("width", Dosyatc.CPB_width + "px");
		}

		if(Dosyatc.CPB_loop){
			clearTimeout(Dosyatc.CPB_status_timer);
			Dosyatc.CPB_status_timer = setTimeout("Dosyatc.smoothCedricStatus()", Dosyatc.CPB_time_width);
		}
	},

	// Make the bytes uploaded smooth
	smoothCedricBytes:function(){
		if(Dosyatc.CPB_bytes < Dosyatc.total_kbytes && !Dosyatc.CPB_hold){
			Dosyatc.CPB_bytes++;
			JQ("#current_position").html(Dosyatc.CPB_bytes);
		}

		if(Dosyatc.CPB_loop){
			clearTimeout(Dosyatc.CPB_byte_timer);
			Dosyatc.CPB_byte_timer = setTimeout("Dosyatc.smoothCedricBytes()", Dosyatc.CPB_time_bytes);
		}
	},

	//Start the progress bar
	startProgressBar:function(upload_id, upload_size, start_time){
		Dosyatc.upload_id = upload_id;
		Dosyatc.total_upload_size = upload_size;
		Dosyatc.start_time = start_time;
		Dosyatc.progress_data = "upload_id=" + Dosyatc.upload_id + "&start_time=" + Dosyatc.start_time + "&total_upload_size=" + Dosyatc.total_upload_size;
		Dosyatc.total_kbytes = Math.round(Dosyatc.total_upload_size / 1024);
		Dosyatc.CPB_loop = true;

		JQ("#progress_bar_container").fadeIn("fast");
		Dosyatc.showAlertMessage("Yükleme Durumu");

		if(Dosyatc.show_current_position){ JQ("#total_kbytes").html(Dosyatc.total_kbytes + " "); }
		if(Dosyatc.show_elapsed_time){ Dosyatc.UP_timer = setInterval("Dosyatc.getElapsedTime()", 1000); }

		Dosyatc.getProgressStatus();

		if(Dosyatc.cedric_progress_bar){
			if(Dosyatc.show_current_position){ Dosyatc.smoothCedricBytes(); }
			Dosyatc.smoothCedricStatus();
		}
	},

	// Calculate and display upload information
	setProgressStatus:function(total_bytes_read, files_uploaded, current_file, bytes_read, lapsed_time){
		var byte_speed = 0;
		var time_remaining = 0;

		if(lapsed_time > 0){ byte_speed = total_bytes_read / lapsed_time; }
		if(byte_speed > 0){ time_remaining = Math.round((Dosyatc.total_upload_size - total_bytes_read) / byte_speed); }

		if(Dosyatc.cedric_progress_bar === 1){
			if(byte_speed !== 0){
				var temp_CPB_time_width = Math.round(Dosyatc.total_upload_size * 1000 / (byte_speed * Dosyatc.progress_bar_width));
				var temp_CPB_time_bytes = Math.round(1024000 / byte_speed);

				if(temp_CPB_time_width < 5001){ Dosyatc.CPB_time_width = temp_CPB_time_width; }
				if(temp_CPB_time_bytes < 5001){ Dosyatc.CPB_time_bytes = temp_CPB_time_bytes; }
			}
			else{
				Dosyatc.CPB_time_width = 500;
				Dosyatc.CPB_time_bytes = 15;
			}
		}

		// Calculate percent_complete finished
		var percent_complete = Math.floor(100 * parseInt(total_bytes_read, 10) / parseInt(Dosyatc.total_upload_size, 10));

		if(percent_complete === Infinity){ percent_complete = 0; }

		var progress_bar_status = Math.floor(Dosyatc.progress_bar_width * (parseInt(total_bytes_read, 10) / parseInt(Dosyatc.total_upload_size, 10)));

		// Calculate time remaining
		var remaining_sec = (time_remaining % 60);
		var remaining_min = (((time_remaining - remaining_sec) % 3600) / 60);
		var remaining_hours = ((((time_remaining - remaining_sec) - (remaining_min * 60)) % 86400) / 3600);

		if(remaining_sec < 10){ remaining_sec = "0" + remaining_sec; }
		if(remaining_min < 10){ remaining_min = "0" + remaining_min; }
		if(remaining_hours < 10){ remaining_hours = "0" + remaining_hours; }

		var est_time_left = remaining_hours + ":" + remaining_min + ":" + remaining_sec;
		var est_speed = Math.round(byte_speed / 1024);
		var current_position = Math.round(total_bytes_read / 1024);

		if(Dosyatc.cedric_progress_bar === 1){
			if(Dosyatc.cedric_hold_to_sync){
				if(progress_bar_status < Dosyatc.CPB_width){ Dosyatc.CPB_hold = true; }
				else{
					Dosyatc.CPB_hold = false;
					Dosyatc.CPB_width = progress_bar_status;
					Dosyatc.CPB_bytes = current_position;
				}
			}
			else{
				Dosyatc.CPB_hold = false;
				Dosyatc.CPB_width = progress_bar_status;
				Dosyatc.CPB_bytes = current_position;
			}

			JQ("#progress_bar").css("width", progress_bar_status + "px");
		}
		else if(Dosyatc.bucket_progress_bar === 1){
			Dosyatc.BPB_width_old = Dosyatc.BPB_width_new;
			Dosyatc.BPB_width_new = progress_bar_status;

			if((Dosyatc.BPB_width_inc < Dosyatc.BPB_width_old) && (Dosyatc.BPB_width_new > Dosyatc.BPB_width_old)){ Dosyatc.BPB_width_inc = Dosyatc.BPB_width_old; }

			clearInterval(Dosyatc.BPB_timer);
			Dosyatc.BPB_timer = setInterval("Dosyatc.incrementProgressBar()", 10);
		}
		else{ JQ("#progress_bar").css("width", progress_bar_status + "px"); }

		if(Dosyatc.show_current_position){ JQ("#current_position").html(current_position); }
		if(Dosyatc.show_current_file){ JQ("#current_file").html(current_file); }
		if(Dosyatc.show_percent_complete){ JQ("#percent_complete").html(percent_complete + "%"); }
		if(Dosyatc.show_files_uploaded){ if(files_uploaded > 0){ JQ("#files_uploaded").html(files_uploaded); } }
		if(Dosyatc.show_est_time_left){ JQ("#est_time_left").html(est_time_left); }
		if(Dosyatc.show_est_speed){ JQ("#est_speed").html(est_speed); }
	},

	incrementProgressBar:function(){
		if(Dosyatc.BPB_width_inc < Dosyatc.BPB_width_new){
			Dosyatc.BPB_width_inc++;
			JQ("#progress_bar").css("width", Dosyatc.BPB_width_inc + "px");
		}
	},

	// Calculate the time spent uploading
	getElapsedTime:function(){
		Dosyatc.seconds++;

		if(Dosyatc.seconds === 60){
			Dosyatc.seconds = 0;
			Dosyatc.minutes++;
		}

		if(Dosyatc.minutes === 60){
			Dosyatc.minutes = 0;
			Dosyatc.hours++;
		}

		var hr = "" + ((Dosyatc.hours < 10) ? "0" : "") + Dosyatc.hours;
		var min = "" + ((Dosyatc.minutes < 10) ? "0" : "") + Dosyatc.minutes;
		var sec = "" + ((Dosyatc.seconds < 10) ? "0" : "") + Dosyatc.seconds;

		JQ("#elapsed_time").html(hr + ":" + min + ":" + sec);
	},

	// Add one upload slot
	addUploadSlot:function(){
		if(JQ(".upfile_ultimo").val() !== ""){
			if(JQ(".upfile").length < Dosyatc.max_upload_slots + 1){
				if(JQ(".upfile").length > 0){
					JQ(".upfile_ultimo").hide();
					JQ("#upload_slots_container").show();
					JQ("#upload_slots_container").append('<div class="upfile_label" id="' + JQ(".upfile_ultimo").attr("id") +'_label"><span class="upfile_name">' + Dosyatc.getFileName(JQ(".upfile_ultimo").val()) + '</span><span class="upfile_remove" title="Remove File" onClick="Dosyatc.deleteUploadSlot(\'' + JQ(".upfile_ultimo").attr("id") + '\')">[x]</span></div>');
					//JQ("#upload_slots_container").append('<div class="upfile_label" id="' + JQ(".upfile_ultimo").attr("id") +'_label"><span class="upfile_name">' + Dosyatc.getFileName(JQ(".upfile_ultimo").val()) + '</span><span class="upfile_remove" title="Remove File" onClick="Dosyatc.deleteUploadSlot(\'' + JQ(".upfile_ultimo").attr("id") + '\')"></span></div>');
				}

				var id = new Date().getTime();

				JQ(".upfile_ultimo").removeClass("upfile_ultimo");
				JQ("#file_picker_container").prepend('<input type="file" class="upfile upfile_ultimo" name="upfile_' + id + '" id="upfile_' + id + '" size="50" value="Upload">');
				JQ("#upfile_" + id).bind("keypress", function(e){
					var code = (e.keyCode ? e.keyCode : e.which);
					if(code === 13){ return false; }
				});
				JQ("#upfile_" + id).bind("change", function(e){ Dosyatc.addUploadSlot(); });

				if(JQ(".upfile").length > Dosyatc.max_upload_slots){ JQ(".upfile_ultimo").fadeOut("fast"); }
			}
		}
	},

	deleteUploadSlot:function(id){
		JQ("#"+id).remove();
		JQ("#"+id+'_label').remove();

		if(JQ(".upfile").length <= Dosyatc.max_upload_slots){ JQ(".upfile_ultimo").fadeIn("fast"); }
		if(JQ(".upfile").length === 1){ JQ("#upload_slots_container").hide(); }
	},

	toggleUploadStats:function(){
		if(Dosyatc.toggle_upload_stats){
			if(Dosyatc.show_files_uploaded || Dosyatc.show_current_position || Dosyatc.show_elapsed_time || Dosyatc.show_est_time_left || Dosyatc.show_est_speed){
				JQ("#upload_stats_toggle").html("[+]");
				//JQ("#upload_stats_toggle").css({ backgroundImage : "url(./images/toggle.png)" });
			}

			JQ("#upload_stats_container").slideUp("fast");
			Dosyatc.toggle_upload_stats = 0;
		}
		else{
			if(Dosyatc.show_files_uploaded || Dosyatc.show_current_position || Dosyatc.show_elapsed_time || Dosyatc.show_est_time_left || Dosyatc.show_est_speed){
				JQ("#upload_stats_toggle").html("[-]");
				//JQ("#upload_stats_toggle").css({ backgroundImage : "url(./images/toggle_collapse.png)" });
			}

			JQ("#upload_stats_container").slideDown("fast");
			Dosyatc.toggle_upload_stats = 1;
		}
	}
};