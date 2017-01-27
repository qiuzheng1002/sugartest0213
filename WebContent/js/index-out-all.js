// 検索ボックス作成
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.whouse.id);
	option.text(row.whouse.name);
	$('select[name="q1"]').append(option);
}

var rows = alasql('SELECT * FROM kind;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.kind.id);
	option.text(row.kind.text);
	$('select[name="q2"]').append(option);
}

// 検索条件の取得
var q1 = parseInt($.url().param('q1') || '0');
$('select[name="q1"]').val(q1);
var q2 = parseInt($.url().param('q2') || '0');
$('select[name="q2"]').val(q2);
var q3 = $.url().param('q3') || '';
$('input[name="q3"]').val(q3);

// SQLの生成
var sql = 'SELECT * \
	FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var stocks = alasql(sql, [ q3 + '%' ]);

/* HTML作成
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks.length; i++) {
	var stock = stocks[i];
	var tr = $('<tr data-href="stock-out.html?id=' + stock.stock.id + '"></tr>');
	tr.append('<td>' + stock.whouse.name + '</td>');
	tr.append('<td class="hidden">' + stock.kind.text + '</td>');
	tr.append('<td class="hidden">' + stock.item.code + '</td>');
	tr.append('<td>' + stock.item.maker + '</td>');
	tr.append('<td>' + stock.item.detail + '</td>');
	tr.append('<td style="text-align: right;">' + numberWithCommas(stock.item.price) + '</td>');
	tr.appendTo(tbody);
}
*/

//受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans \
	JOIN stock ON stock.id = trans.stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE trans.purpose = 2 AND trans.state = 4 OR trans.state = 5');

var tbody = $('#tbody-mi_shukko');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var state_check = row.trans.state;
	var tr = $('<tr data-href="stock-out.html?id=' + row.trans.stock + '"></tr>');
	tr.append('<td>' + row.whouse.name + '</td>');
	tr.append('<td class="hidden">' + row.kind.text + '</td>');
	tr.append('<td class="hidden">' + row.item.code + '</td>');
	tr.append('<td>' + row.item.maker + '</td>');	
	tr.append('<td>' + row.item.detail + '</td>');
	tr.append('<td class="hidden">' + row.trans.date + '</td>');
	tr.append('<td class="hidden">' + row.trans.shop + '</td>');
	tr.append('<td>' + numberWithCommas(row.trans.num) + '</td>');
	tr.append('<td>' + row.trans.deadline + '</td>');
	if (state_check == 4){
		tr.append('<td class="table_state">' + '<button class="btn btn-danger btn-xs" id="fix_data_address">受注済み</button>' + '</td>');
	}
	else if (state_check == 5){
		tr.append('<td class="table_state">' + '<button class="btn btn-warning btn-xs" id="fix_data_address">納期確定済み</button>' + '</td>');
	}
	tr.appendTo(tbody);
}

//履歴データ編集 
$(function(){
	$(document).on("click","#fix_data_address",function() {
		var fix_data_address = $(this).parent().parent();
		var tableid = document.getElementById('#mi_shukko_table');
		var fd_address_rows = fix_data_address.index(this.rowIndex) + 1;
		var fix_date = tableid.rows[fd_address_rows].cells[0].innerText;
		var fix_shop = tableid.rows[fd_address_rows].cells[1].innerText;
		var fix_num_comma = tableid.rows[fd_address_rows].cells[2].innerText;
		var fix_num = parseInt(fix_num_comma.replace(/,/g,""));
		var fix_deadline = tableid.rows[fd_address_rows].cells[3].innerText;
		var fix_state_num = tableid.rows[fd_address_rows].cells[4].innerText;
		if (fix_state_num == "出庫済み"){
			var fix_state = 6;
		}
		else if (fix_state_num == "納期確定済み"){
			var fix_state = 5;
		}
		else if (fix_state_num == "受注済み"){
			var fix_state = 4;
		}
		var fix_words = "WHERE date = '" + fix_date + "' AND shop = '" + fix_shop + "' AND num = " + fix_num + " AND deadline = '" + fix_deadline + "' AND state = " + fix_state ;
		var fix_row_id_obj = alasql('SELECT id FROM trans ' + fix_words)[0]; //編集するデータのidを割り出す (条件だけで検索すると、同じ条件が複数あった場合にバグる)
		var fix_row_id = fix_row_id_obj["id"];
		fix_data_address = "";
		window.location.assign('stock-out-fix.html?id=' + fix_row_id);
	});
});


// 受注データ0件の処理
var table_length = mi_shukko_table.rows.length;
if (table_length == 1){
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>受注データなし</td>');
	tr.append('<td class="hidden">-</td>');
	tr.append('<td class="hidden">-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td class="hidden">-</td>');
	tr.append('<td class="hidden">-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});
