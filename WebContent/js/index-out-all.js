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
var sql = 'SELECT * FROM stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE item.code LIKE ? ';

sql += q1 ? 'AND whouse.id = ' + q1 + ' ' : '';
sql += q2 ? 'AND kind.id = ' + q2 + ' ' : '';

// SQL実行
var stocks = alasql(sql, [ q3 + '%' ]);

//受注・出庫データ読み込み
var rows = alasql('SELECT * FROM trans \
	JOIN stock ON stock.id = trans.stock \
	JOIN whouse ON whouse.id = stock.whouse \
	JOIN item ON item.id = stock.item \
	JOIN kind ON kind.id = item.kind \
	WHERE trans.purpose = 2 AND trans.state = 4 OR trans.state = 5');

//未出庫リスト作成
var tbody = $('#tbody-mi_shukko');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var state_check = row.trans.state;
	var tr = $('<tr data-href="stock-out-fix.html?id=' + row.trans.id + '"></tr>');
	tr.append('<td>' + row.whouse.name + '</td>');
	tr.append('<td>' + row.kind.text + '</td>');
	tr.append('<td>' + row.item.code + '</td>');
	tr.append('<td>' + row.item.maker + '</td>');	
	tr.append('<td>' + row.item.detail + '</td>');
	tr.append('<td class="hidden">' + row.trans.date + '</td>');
	tr.append('<td class="hidden">' + row.trans.shop + '</td>');
	tr.append('<td>' + numberWithCommas(row.trans.num) + '</td>');
	tr.append('<td>' + row.trans.deadline + '</td>');
	if (state_check == 4){
		tr.append('<td class="table_state">' + '<span class="label label-danger" id="fix_data_address" name="' + row.trans.id + '">受注済み</span>' + '</td>');
	}
	else if (state_check == 5){
		tr.append('<td class="table_state">' + '<span class="label label-warning" id="fix_data_address" name="' + row.trans.id + '">納期確定済み</span>' + '</td>');
	}
	tr.appendTo(tbody);
}

//履歴データ編集 
$(function(){
	$(document).on("click","#fix_data_address",function() {
		var fix_row_id = $(this).attr("name");
		window.location.assign('stock-out-fix.html?id=' + fix_row_id);
	});
});

// 受注データ0件の処理
var table_length = mi_shukko_table.rows.length;
if (table_length == 1){
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>受注データなし</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
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
