var chapters = {
    "Entire spec" : {"issues":[], "owner": "Nikos"},
    "Introduction" : {"issues":[], "owner": "Cyril"},
    "Rendering Model chapter" : {"issues":[], "owner": "Nikos"},
    "Basic Data Types and Interfaces chapter" : {"issues":[], "owner": "Cameron"},
    "Document structure chapter" : {"issues":[], "owner": "Erik"},
    "Styling chapter" : {"issues":[], "owner": "Cameron"},
    "Geometry Properties chapter" : {"issues":[], "owner": "Dirk"},
    "Co-ordinates chapter" : {"issues":[], "owner": "Dirk / Rossen"},
    "Paths chapter" : {"issues":[], "owner": "Cameron / Bogdan"},
    "Basic Shapes" : {"issues":[], "owner": "Rossen"},
    "Text chapter" : {"issues":[], "owner": "Tav / Cameron"},
    "Embedded Content chapter" : {"issues":[], "owner": "Bogdan"},
    "Painting chapter" : {"issues":[], "owner": "Cameron / Dirk"},
    "Paint Servers chapter" : {"issues":[], "owner": "Tav / Erik"},
    "Scripting chapter" : {"issues":[], "owner": "Bogdan"},
    "Linking chapter" : {"issues":[], "owner": "Bogdan / Amelia"},
    "Appendices" : {"issues":[], "owner": ""}
}

function escapeXML(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

function httpGetAsync(theUrl, callback, callback_data, page)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, callback_data);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function output_issue_to_list(list, issue) {
    var li = document.createElement("li");
    li.setAttribute("id", "issue_"+issue.number);
    list.appendChild(li); 
    
    var div = document.createElement("div");
    li.appendChild(div);

    var link = document.createElement("a");
    link.setAttribute("href", "https://github.com/w3c/svgwg/issues/" + issue.number);
    link.innerHTML = escapeXML(issue.title);
    div.appendChild(link);
}

function output_message(parent, message) {
    var o = document.createElement("div");
    o.setAttribute("class", "table-message");
    o.innerHTML = message;
    parent.appendChild(o);
}

function new_chapter_div(parent) {
    var div = document.createElement("div");
    div.setAttribute("class", "chapter");
    parent.appendChild(div);
    return div;        
}

function new_issue_list(parent, title, owner) {
    var header = document.createElement("div");
    header.setAttribute("class", "table-header");
    header.setAttribute("id", title);
    parent.appendChild(header);

    var link = document.createElement("a");
    link.setAttribute("href", "https://github.com/w3c/svgwg/issues?q=is%3Aissue+label%3A%22"+encodeURI(title)+"%22");
    link.innerHTML = escapeXML(title);
    header.appendChild(link);

    var open_list = document.createElement("ul");
    open_list.setAttribute("class", "table-body");
    parent.appendChild(open_list);

    var closed_list = document.createElement("ul");
    closed_list.setAttribute("id", title+" Closed");
    closed_list.setAttribute("class", "table-body closed-issues");
    parent.appendChild(closed_list);

    var metadata_div = document.createElement("div");
    header.appendChild(metadata_div);
    metadata_div.setAttribute("class", "metadata");
    metadata_div.innerHTML = owner;

    return {"header": header, "open_list": open_list, "closed_list": closed_list};
}

function write_list_header(list, open, closed) {
    var open_elem = document.createElement("span");
    open_elem .setAttribute("class", "num-open");
    open_elem .innerHTML = open + " Open";
    list.header.insertBefore(open_elem, list.header.querySelector(".metadata"));

    var closed_elem = document.createElement("span");
    closed_elem .setAttribute("class", "num-closed");
    closed_elem .innerHTML = closed + " Closed";
    list.header.insertBefore(closed_elem, list.header.querySelector(".metadata"));
}

function output_chapter_summary(chapter, owner, nopen, nclosed) {
    var list = document.querySelector("#issue-summary-list");

    var title_cell = document.createElement("td");
    title_cell.setAttribute("class", "index-cell");

    var index_link = document.createElement("a");
    index_link.setAttribute("href", "#"+chapter);
    index_link.innerHTML = chapter;
    title_cell.appendChild(index_link);

    var owner_cell = document.createElement("td");
    owner_cell.setAttribute("class", "index-cell");
    owner_cell.innerHTML = owner;

    var open_count = document.createElement("td");
    open_count.setAttribute("class", "index-cell num-open");
    open_count.innerHTML = nopen;

    var list_item = document.createElement("tr");
    list_item.appendChild(title_cell);
    list_item.appendChild(owner_cell);
    list_item.appendChild(open_count);
    //list_item.appendChild(closed_count);

    list.appendChild(list_item);
}

function output_list(issues) {
    var chapter_names = Object.keys(chapters);
    var div = document.querySelector("#issues");

    for (issue of issues) {
        for (label of issue.labels) {
            if (chapter_names.includes(label.name)) {
                chapters[label.name].issues.push(issue);
            }
        }    
    }

    for (chapter_name of chapter_names) {
        var chapter = chapters[chapter_name];
        var ui_chapter = new_chapter_div(div);
        var ui_issue_list = new_issue_list(ui_chapter, chapter_name, chapter.owner);
        var open = 0;
        var closed = 0;

        if (chapter.issues.length > 0) {
            for (issue of chapter.issues) {
                if (issue.state == "open") {
                    open ++;
                    output_issue_to_list(ui_issue_list.open_list, issue);
                } else {
                    closed ++;
                    output_issue_to_list(ui_issue_list.closed_list, issue);
                }
            }
            write_list_header(ui_issue_list, open, closed);
            output_chapter_summary(chapter_name, chapter.owner, open, closed);
        } else {
            output_message(div, "No issues");
        }
    }
}

function get_json_issues(prev_issues = [], page = 1) {
    console.log('getting issues for page ' + page);
    httpGetAsync(
        'https://api.github.com/repos/w3c/svgwg/issues?state=all&page='+page,
        issue_json_received,
        { "prev_issues": prev_issues, "page": page}
    );
}

function issue_json_received(responseText, user_data) {
    var prev_issues = user_data.prev_issues;
    var page = user_data.page;
    var issues = JSON.parse(responseText);
    if (issues.length > 0) {
        get_json_issues(prev_issues.concat(issues), page + 1);
    } else {
        output_list(prev_issues);
    }
}

window.onload=function() {
    get_json_issues();
}
