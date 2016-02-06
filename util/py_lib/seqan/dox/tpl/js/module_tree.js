/* Jongkyu Kim (j.kim@fu-berlin.de), 2016.02.05 */

var DELIMITER = "/";

function getIndexByKey(tree, key) {
    for( var i=0; i < tree.length; ++i )
        if( tree[i].text == key )
            return i;
    return -1;
}
 
function updateByKeys(tree, keys) {
    var key = keys[0]
    var pos = getIndexByKey(tree, key);

    if( keys.length > 1 ) {
        var next_key = keys.slice(1, keys.length);
        if( pos == -1 ) { // new
            var obj = new Object();
            obj.text = key;
            obj.href = key;
            obj.tags = [1];
            obj.nodes = Array();
            tree.push(obj);
            updateByKeys(obj.nodes, next_key);
        } else {
            if(tree[pos].tags == null)
            {
                tree[pos].tags = [1];
                tree[pos].nodes = Array();
            }
            else
                ++(tree[pos].tags[0]);
            updateByKeys(tree[pos].nodes, next_key);
        }
    } else {
        if( pos == -1) {
            var obj = new Object();
            obj.text = keys;
            obj.href = keys;
            obj.tags = null;
            obj.nodes = null;
            tree.push(obj);
        }
    }
}
function updateTags(tree) {
    for(var i=0; i < tree.length; ++i) {
        if(tree[i].nodes)
            tree[i].tags = [tree[i].nodes.length];
        updateTags(tree[i]);
    }
}

function compare(a,b) {
    var len = (a.length < b.length) ? a.length : b.length;
    for(var i=0; i < len; ++i)
        if(a[i] != b[i])
            return a[i].localeCompare(b[i]);

    return 1;
}


// load data 
var srcfileList = []
for(var i=0; i < window.searchData.length; ++i) {
    var srcfile = window.searchData[i].srcfile
    if(srcfile == "" || srcfile.indexOf(".h") == -1)
        continue;
    srcfileList.push(srcfile.replace("|",DELIMITER).replace(".h","").split("/"));
}

// sorting
srcfileList.sort(compare);

// build tree 
var treeData = []; 
for(var i=0; i < srcfileList.length; ++i) {
    updateByKeys(treeData, srcfileList[i] );
}
updateTags(treeData);

// add HTML 
var mt_div = document.createElement("div");
mt_div.setAttribute("id", "module_tree");
document.body.insertBefore(mt_div, document.getElementById("Results"));

// add tree
$('#module_tree').treeview({
    levels: 1,
    data: treeData,
    showBorder: false,
    showTags: true
});

$('#module_tree').on('nodeSelected', function(event, data) {
    var sNode = $('#module_tree').treeview('getSelected', 0)[0];
    var pNodes = $('#module_tree').treeview('getParent', sNode);
    var query = sNode.href;

    // parent node
    if(pNodes.hasOwnProperty("href")) {
       query = pNodes.href + "/" + query;
    }
    //console.log(query);
    //
    $("#search").find("input[type=text],input[type=search]").val("module:"+query);
    $("#search").find("input[type=text],input[type=search]").trigger("change");
});
