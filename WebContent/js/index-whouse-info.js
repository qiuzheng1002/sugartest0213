// SQL(whouseより)
var whouses = alasql('SELECT * FROM whouse');

// HTML作成
var tbody = $('#tbody-whouse');
for (var i = 0; i < whouses.length; i++) {
	var whouse_object = whouses[i];
	var whouse = $(whouse_object).attr("whouse"); //object皮むき
	var tr = $('<tr data-href="whouse-info.html?id=' + whouse.id + '"></tr>');
	tr.append('<td class="table-data">' + whouse.id + '</td>');
	tr.append('<td>' + whouse.name + '</td>');
	tr.append('<td>' + whouse.addr + '</td>');
	tr.append('<td>' + whouse.tel + '</td>');
	tr.appendTo(tbody);
}

//登録データ0件の処理
var table_length = index_whouse_table.rows.length;
if (table_length == 1){
	var tr = $('<tr data-href="index-whouse-info.html">').appendTo(tbody);
	tr.append('<td>登録データなし</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
	tr.append('<td>-</td>');
}

// 新規登録ボタン
function add_data(){
	window.location.assign('whouse-info.html');
};

// クリック動作
$('tbody > tr').css('cursor', 'pointer').on('click', function() {
	window.location = $(this).attr('data-href');
});

//タブhover
$(function(){
	$("ul.dropdown-menu").hide();
	$("li.dropdown").hover(function(){
		$("ul:not(:animated)",this).slideDown("fast");
	},
	function(){
		$("ul",this).slideUp("fast");
	});
});