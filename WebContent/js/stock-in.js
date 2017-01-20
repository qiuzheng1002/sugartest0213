// ID取得
var id = parseInt($.url().param('id'));
$("input[name=id]").val(id);


//変更
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
