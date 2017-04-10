// find the websites
// var streets = 'https://phila-gisdata.s3.amazonaws.com/ODP/STR_Centerline.csv';
// $.ajax(streets).done(function(data){
//   console.log('streets:',data);
// });
var allScores = "https://gist.githubusercontent.com/KristenZhao/6f6ddfe48028b1df93f2ffa77c37eb45/raw/2b067d4a111b768075c34f6a6c1253ddf7e2f2b9/laneConnSlope_score";
// var crashes = 'https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Collisions_crash_2011_2014PUBV/FeatureServer/2/query?where=1%3D1&objectIds=&time=&resultType=none&outFields=*&returnIdsOnly=false&returnCountOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&resultOffset=&resultRecordCount=&sqlFormat=none&f=pgeojson&token=';
$(document).ready(function(){
  $.ajax(laneConnSlope_score).done(function(data){
    laneConnSlope_score_parsed = JSON.parse(data);
    console.log('parsed:',laneConnSlope_score_parsed);
  });
  // $.ajax(crashes).done(function(data){
  //   crashes_parsed = JSON.parse(data);
  //   console.log('parsed crash:',crashes_parsed);
  // });
});
