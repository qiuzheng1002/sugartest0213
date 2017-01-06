// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

// 商品情報読み込み
var sql = 'SELECT * \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE stock.id = ?';
var row = alasql(sql, [ id ])[0];
$('#image').attr('src', 'img/' + row.item.id + '.jpg');
$('#whouse').text(row.whouse.name);
$('#code').text(row.item.code);
$('#maker').text(row.item.maker);
$('#detail').text(row.item.detail);
$('#price').text(numberWithCommas(row.item.price));
var balance = row.stock.balance; // 入出庫で利用
$('#balance').text(balance);
$('#leadtime').text(row.item.leadtime + '日');

// トランザクション読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-transs');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>' + row.trans.date + '</td>');
	tr.append('<td></td>');
	tr.append('<td>' + row.trans.qty + '</td>');
	tr.append('<td>' + row.trans.balance + '</td>');
	tr.append('<td>' + row.trans.memo + '</td>');
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
}

// 入庫・出庫処理
$('#update').on('click', function() {
	var date = $('input[name="date"]').val();
	var qty = parseInt($('input[name="qty"]').val());
	var memo = $('textarea[name="memo"]').val();
	alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, id ]);
	var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
	alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, id, date, qty, balance + qty, memo ]);
	window.location.assign('stock.html?id=' + id);
});

//本日の日付を自動入力
$(function(){
	setInterval(function(){
		var time = $.now();
		var dateObj = new Date(time);
		var y = dateObj.getFullYear();
		var m = dateObj.getMonth() + 1;
			if(m<10){m = "0" + m}
		var d = dateObj.getDate();
			if(d<10){d = "0" + d}
		var h = dateObj.getHours();
			if(h<10){h = "0" + h}
		var min = dateObj.getMinutes();
			if(min<10){min = "0" + min}
		var select_d = y + '-' + m + '-' + d + ' ' + h + ':' + min;
		$("#selected_date").attr("value", select_d);
	}, 1000);
});



//変更履歴：削除する行の設定
var dd_address="";
$(function(){
	$(document).on("click","#delete_data_address",function() {
		dd_address = $(this).parent().parent();
	});
});
//変更履歴：データ削除
$(function(){
	$(document).on("click","#destroy_data",function() {
		var tableid = document.getElementById('rireki_table');
		var dd_address_rows = dd_address.index(this.rowIndex) + 1;
		var delete_date = tableid.rows[dd_address_rows].cells[0].innerText;
		var delete_order = tableid.rows[dd_address_rows].cells[1].innerText;
		var delete_in = tableid.rows[dd_address_rows].cells[2].innerText;
		var delete_out = tableid.rows[dd_address_rows].cells[3].innerText;
		var delete_company = tableid.rows[dd_address_rows].cells[4].innerText;
		console.log(delete_date);
		console.log(delete_order);
		console.log(delete_in);
		console.log(delete_out);
		console.log(delete_company);

		var date = $('input[name="date"]').val();
		var qty = parseInt($('input[name="qty"]').val());
		var memo = $('textarea[name="memo"]').val();
		alasql('UPDATE stock SET balance = ? WHERE id = ?', [ balance + qty, id ]);
		var trans_id = alasql('SELECT MAX(id) + 1 as id FROM trans')[0].id;
		alasql('INSERT INTO trans VALUES(?,?,?,?,?,?)', [ trans_id, id, date, qty, balance + qty, memo ]);
		window.location.assign('stock.html?id=' + id);
		$(dd_address).remove();
		dd_address = "";
	});
});

