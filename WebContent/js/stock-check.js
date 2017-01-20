


//標準偏差
$(function(){

//標準偏差：平均
var hensa_box = [32,27,29,34,33];

function getAverage(hensa_box){
	var sum = 0;
	var average = -1;
	for(var i=0; i<hensa_box.length; i++){
		sum += hensa_box[i];
	}
	average = sum / hensa_box.length;
	return average;
}

//標準偏差：分散
function getVariance(hensa_box){
	var average = getAverage(hensa_box);
	var variance = -1;
	var sum = 0;
	for (var i=0; i<hensa_box.length; i++){
		sum += Math.pow((hensa_box[i] - average), 2);
	}
	variance = sum / hensa_box.length;
	return variance;
}

//標準偏差(分散のルート)
function getStandardDeviation(hensa_box){
	var variance = getVariance(hensa_box);
	var standardDeviation = Math.sqrt(variance);
	return standardDeviation;
}

var hensa = getStandardDeviation(hensa_box);
//四捨五入
function floatFormat(number){
	var _pow = Math.pow(10, 2);
	return Math.round(number * _pow) / _pow;
}
var hensa_float = floatFormat(hensa);
$("#hensa").append(hensa_float);
})