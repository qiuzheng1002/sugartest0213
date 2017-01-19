// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);

//出庫情報読み込み
var rows = alasql('SELECT * FROM itemout WHERE stock = ?', [ id ]);
var tbody = $('#tbody-shukko_table');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>' + row.itemout.date + '</td>');
	tr.append('<td>' + row.itemout.memo + '</td>');
	tr.append('<td>' + row.itemout.order_wh + '</td>');
	tr.append('<td>' + row.itemout.deadline + '</td>');
	tr.append('<td>' + row.itemout.state + '</td>');}
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');


/*


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
$('#leadtime').text(row.item.leadtime + '日');
$('#lack').text(row.item.lack + '%');

// トランザクション読み込み
var rows = alasql('SELECT * FROM trans WHERE stock = ?', [ id ]);
var tbody = $('#tbody-transs');
for (var i = 0; i < rows.length; i++) {
	var row = rows[i];
	var tr = $('<tr>').appendTo(tbody);
	tr.append('<td>' + row.trans.date + '</td>');
	if (row.trans.order_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.order_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.order_wh + '</td>');}
	if (row.trans.in_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.in_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.in_wh + '</td>');}
	if (row.trans.out_wh === 0){
		tr.append('<td style="color: #FFFFFF;">' + row.trans.out_wh + '</td>');}
	else {
		tr.append('<td>' + row.trans.out_wh + '</td>');}
	tr.append('<td>' + row.trans.memo + '</td>');
	tr.append('<td class="text-right"><button type="button" class="btn btn-xs" id="delete_data_address" data-toggle="modal" data-target="#delete_data"><span class="glyphicon glyphicon-remove"></span></button></td>');
}

*/
