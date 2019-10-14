//Initiate packages
var express = require('express');
var app = express();
var request = require('request');
var https = require('https');
var path = require('path');
 var async = require('async');

//Set up paths for the website
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.render('MainEn');
});

app.get('/Russian', function (req, res) {
    res.render('MainRus');
});

app.get('/English', function (req, res) {
    res.render('MainEn');
});



//The search function on the english version of the website
app.post('/searchEn', function (searchReq, searchRes) {   
	//Retrieve inputed word
    var searchInput = "";
    var searchInputVal = "";
    searchReq.on('data', function (data) {
        searchInput += data;
        console.log("searchInput " + searchInput);
        searchInput = searchInput.split("=");
        searchInputVal = searchInput[1];
        console.log("searchInputVal: " + searchInputVal);

	//Calling for three APIs in parallel, function deeply explained in pages 27-28 	
        async.parallel({
            one: function (cb) {
                https.get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20190225T103213Z.42e83f4c43a8ba84.b6336f95c95674b2e33b937c87a52688db0158d6 &lang=en-en&text=' + searchInputVal, (resp) => {
                    
                    let data = '';
                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        var result = JSON.parse(data);
                        cb(null, result);
                    });

                }).on("error", (err) => {
                    cb(err);
                    console.log("Error: " + err.message);
                });
            },
			
            two: function (cb) {
                const lexoptions = {
                    host: 'dictapi.lexicala.com',
                    path: '/search?source=global&language=en&text='+searchInputVal,
                    method: 'GET',
                    headers: {
                        Authorization: 'Basic ' + new Buffer('N_Bryj' + ':' + 'Nourhaha1998').toString('base64'),
                    }
                };
                https.request(lexoptions, function (res) {
                    var body = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        body += chunk;
                    });
                    res.on('end', function () {
                        var result = JSON.parse(body);
                        cb(null, result);
                    });
                    res.on('error', cb);
                })
                    .on('error', cb)
                    .end();
            },
			
			
            three: function (cb) {
				//Calling header
                var postRequest = {
                    host: "od-api.oxforddictionaries.com",
                    path: "/api/v2/entries/en-gb/" + searchInputVal,
                    method: "GET",
                    'content-type': 'application/json',
                    headers: {
                        'app_id': 'd6d66925',
                        'app_key': '79474492264cc2579756f89c3112510f',
                    }
                };
                https.request(postRequest, function (response) {
                    var searchData = "";
					// A chunk of data has been recieved.
                    response.on("data", function (data) {
                        searchData = searchData + data;
                    });
					// The whole response has been received. Print out the result.
                    response.on("end", function (data) {
                        console.log("searchData" + searchData);
                        cb(null, searchData);
                    });
                    response.on('error', cb);
                })
                    .on('error', cb)
                    .end();

            }



        }, function (err, resu) {
            //recieved all three results in JSON, begin formatting
			//Log results
            console.log("Yandex: ");
            console.log(JSON.stringify(resu.one));
            console.log("Lexicala: ");
            console.log(JSON.stringify(resu.two));
            console.log("Oxford: ");
            console.log(JSON.stringify(resu.three));
			//Validate Result
            var yantr = JSON.stringify(resu.one);
            if (yantr.includes('"def":[]') | yantr.includes("Invalid parameter")) {
                yantr = "No word Available";
            } else {
				//If Valid, begin formatting
				var yanres = resu.one;
				//transform fron JSON into an HTML string
                yantr = JSON.stringify(yanres.def[0].tr); 
                yantr = yantr.replace(/((\[\s*)|(\s*\]))/g, "");
                yantr = yantr.replace(/[{}]/g, " ");
                yantr = yantr.replace(/[{}]/g, " ");
                yantr = yantr.replace(/["']/g, "");
                yantr = yantr.replace(/[,]/g, " ");
                yantr = yantr.replace(/[:]/g, ": ");
                yantr = yantr.replace(/pos:/g, ",<b> Type: </b>");
                yantr = yantr.replace(/text:/g, " <br><b> Definition: </b><br>");
                yantr = yantr.replace(/pos:/g, " Type: ");
                yantr = yantr.replace(/syn:/g, "");
                yantr = yantr.replace(/[]]]/g, '');
                yantr = yantr.replace(/[[]/g, '');
                yantr = yantr.replace(/ , /g, ', ');
                yantr = "</p> " + yantr;
                var y = yantr.split("Definition:");
                console.log("YANDEX STRING: " + y);
                var yanstring = ""; 
				//Add copy, size increase, and size decrease buttons
                for (var i = 1; i < y.length; i++) {
                    var wordid = "yanwordid" + i;
                    yanstring =  yanstring + "<p class='defbox' tabindex='0' id=" + wordid + "><b><em> Definition " + i + ": </em></b>"  +
                     "<button aria-label='copy text' class='btn btn-sm copybtn fas fa-copy' onclick='copyToClipboard(&quot #yanwordid"+i
                     +" &quot)' tabindex='0'  style='font-size: 15px;'></button> " + y[i] + "</p>" ;       

                }


            
            }
			//Validate Result
			var oxstr = JSON.stringify(resu.three);
            if (oxstr.includes("No entry found matching supplied source_lang, word and provided filters")) {
                var oxstring = "No word Available"
            } else {
				//If Valid, begin formatting
                var oxdic = JSON.parse(resu.three)
				//transform fron JSON into an HTML string
                oxdic = JSON.stringify(oxdic.results[0].lexicalEntries);
                oxdic = oxdic.replace(/"metadata".*"entries"/g, ' ');
                oxdic = oxdic.replace(/}/g, "");
                oxdic = oxdic.replace(/[[{"]/g, ' ');
                oxdic = oxdic.replace(/}],/g, '');
                oxdic = oxdic.replace(/"],/g, '');
                oxdic = oxdic.replace(/[[{"]/g, '');
                oxdic = oxdic.replace(/[\[\]]+/g, '');
                oxdic = oxdic.replace(/ : /g, ": ");
                oxdic = oxdic.replace(/entries:/g, "");
                oxdic = oxdic.replace(/grammaticalFeatures:/g, " <br>Grammatical Features: <br> ");
                oxdic = oxdic.replace(/text:/g, "Text:");
                oxdic = oxdic.replace(/type:/g, " <br> Type:");
                oxdic = oxdic.replace(/0|1|2|3|4|5|6|7|8|9/g, ' ');
                oxdic = oxdic.replace(/http.*.mp/g, '');
                oxdic = oxdic.replace(/short_Definitions:/g, " <br> in Short:<br>	");
                oxdic = oxdic.replace(/subsenses:/g, "");
                oxdic = oxdic.replace(/homographNumber:       senses:/g, "definition:");
                oxdic = oxdic.replace(/definitions:/g, "  definition:");
                oxdic = oxdic.replace(/[,]/g, " ");
                oxdic = oxdic.replace(/["']/g, "");
                oxdic = oxdic.replace(/short_/g, "");
                oxdic = oxdic.replace(/<\/\p>$/, "");
                oxdic = oxdic.replace(/" etymologies: "/g, "<br> etymologies: <br>");
                var a = oxdic.split("definition:"), i, oxstring;
				//Add copy, size increase, and size decrease buttons
                for (i = 1; i < a.length; i++) {
                    var wordid = "'wordid" + i + "'";
                    var hashword = "#" + wordid;
                    oxstring = oxstring + "<p class='defbox' tabindex='0'  id=" + wordid + i +
					"  ><b><em> Definition " + i +
					": </em></b> <button aria-label='copy text' class='btn btn-sm copybtn fas fa-copy' onclick='copyToClipboard(&quot #wordid"+
					i+" &quot)' tabindex='0' style='font-size: 15px;' ></button>  <br>" + a[i] + " </p> ";
                    oxstring = oxstring.replace(/undefined/, "");
                }
				//Validate Result
                var lexres = JSON.stringify(resu.two);
                if (resu.two.n_results = 0 | !lexres.includes("senses") ) {

             lexres = "Word not Available";

                } else {
					//If Valid, begin formatting
					//transform fron JSON into an HTML string
					//Add copy, size increase, and size decrease buttons
                    var lexj = resu.two.results[0].senses;
                    lexres = "";
                    for (var i = 0; i < lexj.length; i++) {
                        lexres = lexres + "<p autofocus class='defbox' tabindex='0' id='lexwordid" + i + "'><em><b> Definition " + (i+1) + ": </b> </em> <button class='btn btn-sm copybtn fas fa-copy' onclick='copyToClipboard(&quot #lexwordid"+
                        i+" &quot)' tabindex='0' aria-label='copy text'  style='font-size: 15px;'></button>  <br>" +
                         JSON.stringify(lexj[i].definition) +  "  </p> ";

                    }

                }
            }
            searchRes.set({ 'content-type': 'text/html; charset=utf-8' });
            searchRes.render("MainEn", {
                yandextitle: searchInputVal,
                oxtitle: searchInputVal,
                lextitle: searchInputVal,
                yantxt: yanstring,              
                lextxt: lexres,
                oxtxt: oxstring
            });
        });
    });
});



app.post('/searchRus', function (searchReq, searchRes) {
    var searchInput = "";
    var searchInputVal = "";
    searchReq.on('data', function (data) {
        searchInput += data;
        console.log("searchInput " + searchInput);
        searchInput = searchInput.split("=");
        searchInputVal = searchInput[1];
        console.log("searchInputVal" + searchInputVal);
        async.parallel({
            one: function (cb) {
                https.get('https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=dict.1.1.20190225T103213Z.42e83f4c43a8ba84.b6336f95c95674b2e33b937c87a52688db0158d6 &lang=ru-ru&text=' + searchInputVal, (resp) => {
                    let data = '';
                    // A chunk of data has been recieved.
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    // The whole response has been received. Print out the result.
                    resp.on('end', () => {
                        var result = JSON.parse(data);
                        cb(null, result);
                    });
                }).on("error", (err) => {
                    cb(err);
                    console.log("Error: " + err.message);
                });
            },
            two: function (cb) {
                const lexoptions = {
                    host: 'dictapi.lexicala.com',
                    path: '/search?source=global&language=ru&text='+searchInputVal,
                    method: 'GET',
                    headers: {
                        Authorization: 'Basic ' + new Buffer('N_Bryj' + ':' + 'Nourhaha1998').toString('base64'),
                    }
                };
                https.request(lexoptions, function (res) {
                    var body = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        body += chunk;
                    });
                    res.on('end', function () {
                        var result = JSON.parse(body);
                        cb(null, result);
                    });
                    res.on('error', cb);
                })
                    .on('error', cb)
                    .end();
            }
           
        }, function (err, resu) {
            // results will have the results of all 3
            yanres = resu.one;
            var yantr = JSON.stringify(yanres);
            yantr = yantr.trim();
            if (yantr.includes('"def":[]') | yantr.includes("Invalid parameter")) {
                yantr = " No word Available";
            } else {

                yantr = JSON.stringify(yanres.def[0].tr);
                yantr = yantr.replace(/((\[\s*)|(\s*\]))/g, "");
                yantr = yantr.replace(/[{}]/g, " ");
                yantr = yantr.replace(/[{}]/g, " ");
                yantr = yantr.replace(/["']/g, "");
                yantr = yantr.replace(/[,]/g, " ");
                yantr = yantr.replace(/[:]/g, ": ");
                yantr = yantr.replace(/pos:/g, ",<b> Type: </b>");
                yantr = yantr.replace(/text:/g, " <br><b> Definition: </b><br>");
                yantr = yantr.replace(/pos:/g, " Type: ");
                yantr = yantr.replace(/syn:/g, "");
                yantr = yantr.replace(/[]]]/g, '');
                yantr = yantr.replace(/[[]/g, '');
                yantr = yantr.replace(/ , /g, ', ');
                yantr = "</p> " + yantr;
                var y = yantr.split("Definition:");
                console.log("YANDEX STRING: " + y);
                var yanstring = ""; /* = "<p tabindex='0'>" + y[0] + "</p>" */
                for (var i = 1; i < y.length; i++) {
                    var wordid = "yanwordid" + i;
                      yanstring =  yanstring + "<p class='defbox' tabindex='0' id=" + wordid + "><b><em> Определение " + i + ": </em></b>"  +
                       "<button aria-label='copy text' class='btn btn-sm copybtn fas fa-copy' onclick='copyToClipboard(&quot #yanwordid"+i
                       +" &quot)' tabindex='0'  style='font-size: 15px;'></button> " + y[i] + "</p>" ;
                    

                }


            }
           
            var lexres = JSON.stringify(resu.two);

            if (resu.two.n_results = 0 | !lexres.includes("senses")) {

          


                lexres = "Word not Available";

            } else {
                var lexj = resu.two.results[0].senses;
                lexres = "";
                /* 	lexres = JSON.stringify(lexj); */
                /* lexres = lexres.replace(/"id"*."definition"/g, 'Definition: '); 
                lexres = lexres.replace(/["']/g, " "); */
                for (var i = 0; i < lexj.length; i++) {
                    lexres = lexres + "<p autofocus class='defbox' tabindex='0' id='lexwordid" + i + "'><em><b> Определение " + (i+1) + ": </b> </em> <button class='btn btn-sm copybtn fas fa-copy' onclick='copyToClipboard(&quot #lexwordid"+
                    i+" &quot)' tabindex='0' aria-label='copy text'  style='font-size: 15px;'></button>  <br>" +
                     JSON.stringify(lexj[i].definition) +  "  </p> ";

                }
            }

            searchRes.set({ 'content-type': 'text/html; charset=utf-8' });
            var yantr = JSON.stringify(yanres);
            console.log("Yandex: ");
            console.log(resu.one);

            console.log("Lexicala: ");
            console.log(resu.two);
            searchRes.render("MainRus", {
               
                yantxt: yanstring,
                lextxt: lexres,
        
            });
        });

    });

});


var listener = app.listen(8000, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
