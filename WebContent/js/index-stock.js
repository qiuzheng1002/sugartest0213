//プルダウン(商品区分)
var rows = alasql('SELECT * FROM whouse;');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var option = $('<option>');
	option.attr('value', row.whouse.id);
	option.text(row.whouse.name);
	$('select[name="whouse_name"]').append(option);
}


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
var stocks_wh = alasql(sql, [ q3 + '%' ]);

//本日の日付を取得
var time = $.now();
var dateObj = new Date(time);
var	y = dateObj.getFullYear();
var	m = dateObj.getMonth();
var	d = dateObj.getDate();
var date1 = new Date(y, m, d);


// HTML作成
var tbody = $('#tbody-stocks');
for (var i = 0; i < stocks_wh.length; i++) {
	var stock = stocks_wh[i];
	var tr = $('<tr data-href="stock.html?id=' + stock.stock.id + '"></tr>');
	tr.append('<td>' + stock.whouse.name + '</td>');
	tr.append('<td>' + stock.kind.text + '</td>');
	tr.append('<td>' + stock.item.code + '</td>');
	tr.append('<td>' + stock.item.maker + '</td>');
	tr.append('<td>' + stock.item.detail + '</td>');
	var date_sql = alasql("SELECT date FROM trans WHERE stock = " + stock.stock.id + " ORDER BY date DESC")[0];
	var date = $(date_sql).attr("date");
	var year_check = parseInt(date.slice(0,4));
	var month_check = parseInt(date.slice(5,7)) - 1;
	var date_check = parseInt(date.slice(8,10));
	var date2 = new Date(year_check, month_check, date_check);
	var diff = (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
	if(diff <= 7){//new
		tr.append('<td><span class="label label-warning">New!</span></td>');
	}
	else if(diff >= 28){ //old
		tr.append('<td><span class="label label-default">Old</span></td>');
	}
	else{
		tr.append('<td></td>');
	}
	tr.appendTo(tbody);
}

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});

// タブhover
$(function(){
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function(){
		$("ul:not(:animated)",this).slideDown("fast");
	},
	function(){
		$("ul",this).slideUp("fast");
	});
});