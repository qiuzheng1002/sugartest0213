// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-shukko_process_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var purpose_check = row.trans.purpose;
	var state_check = row.trans.state;
	if (purpose_check == 2){
		var tr = $('<tr>').appendTo(tbody);
		tr.append('<td>' + row.trans.date + '</td>');
		tr.append('<td>' + row.trans.shop + '</td>');
		tr.append('<td>' + row.trans.num + '</td>');	
		tr.append('<td>' + row.trans.deadline + '</td>');
		if (state_check == 4){
			tr.append('<td>' + '<span class="label label-danger">受注済み</span>' + '</td>');
		}
		else if (state_check == 5){
			tr.append('<td>' + '<span class="label label-warning">納期回答済み</span>' + '</td>');
		}
		else if (state_check == 6){
			tr.append('<td>' + '<span class="label label-success">出庫済み</span>' + '</td>');
		}
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
	}
}

//受注データ0件の処理
var table_length = syukko_process_table.rows.length;
if (table_length == 1){
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>受注データ未登録</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
}

//受注データ登録ボタン
$('#update_order').on('click', function() {
	var date = $('input[name="date1"]').val();
	var length_check = date.length;
	var year_check = date.slice(0,4);
	var bar1_check = date.charAt(4);
	var month_check = date.slice(5,7);
	var bar2_check = date.charAt(7);
	var date_check = date.slice(8,10);
	var millisec_check = Date.parse(date);
	if (month_check == 1 || month_check == 3 || month_check == 5 || month_check == 7 || month_check == 8 || month_check == 10 || month_check == 12){
		var lastdate_check = 31;
		var lastmonth_check = month_check;
	}
	else {
		var lastdate = new Date(date);
			lastdate.setMonth(lastdate.getMonth() + 1);
			lastdate.setDate(0);
		var lastdate_check = lastdate.getDate();
		var lastmonth_check = lastdate.getMonth() + 1;
	}

	if (length_check == 16 && year_check >= 2010 && year_check <= y+1 && bar1_check == "-" && month_check >= 1 && month_check <=12 && bar2_check == "-" && date_check >=1 && date_check <=31 && millisec_check != "NaN" && lastdate_check >= date_check && month_check == lastmonth_check){
		$("#order-form_date").css("color","black");
		var order_wh = parseInt($('input[name="order_wh"]').val());
		var order_wh2 = $('input[name="order_wh"]').val();
		var order_wh_check = order_wh - order_wh2;
		if (order_wh_check === 0 && order_wh > 0 && order_wh < 1000000){
			$("#order-form_number").css("color","black");
			var in_wh = 0;
			var out_wh = 0;
			var memo = $('input[name="memo1"]').val();
			alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + order_wh, id ]);
			var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
			alasql('INSERT INTO trans VALUES(?,?,?,?,?,?,?)', [ trans_id, id, date, order_wh, in_wh, out_wh, memo ]);
			window.location.assign('stock.html?id=' + id);
		}
		else {
			$("#order-form_number").css("color","red");
			$("#order-form_number").animate({opacity: 0.4},50);
			$("#order-form_number").animate({opacity: 1.0},50);
			$("#order-form_number").animate({opacity: 0.4},50);
			$("#order-form_number").animate({opacity: 1.0},50);
		}
	}
	else{
		$("#order-form_date").css("color","red");
		$("#order-form_date").animate({opacity: 0.4},50);
		$("#order-form_date").animate({opacity: 1.0},50);
		$("#order-form_date").animate({opacity: 0.4},50);
		$("#order-form_date").animate({opacity: 1.0},50);
	}
});

