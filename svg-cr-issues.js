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
   
    var link = document.createElement("a");
    link.setAttribute("href", "https://github.com/w3c/svgwg/issues/" + issue.number);
    link.innerHTML = issue.number;

    var issue_num_container = document.createElement("div");
    issue_num_container.setAttribute("class", "issue-number");
    issue_num_container.appendChild(link);
    li.appendChild(issue_num_container);
 
    var issue_details_container = document.createElement("div");
    issue_details_container.setAttribute("class", "issue-details");
    li.appendChild(issue_details_container);

    var name = document.createElement("div");
    if (issue.state == "closed") {
        name.setAttribute("class", "issue-name closed-issue");
    } else {
        name.setAttribute("class", "issue-name");
    }
    name.innerHTML = escapeXML(issue.title);

    issue_details_container.appendChild(name);

    if (issue.state == "open" && issue.assignee) {
        var assigned = document.createElement("div");
        assigned.setAttribute("class", "issue-owner");
        assigned.innerHTML = "Assigned to: " + issue.assignee.login;
        issue_details_container.appendChild(assigned);
    }

    for (var label of issue.labels) {
        switch (label.name) {
            case "Resolved":
            case "Editing":
            case "Proposal":
            case "Needs removal":
            case "Needs resolution":
            case "Needs WG input":
            case "Needs editing":
            case "Needs data":
                var status = document.createElement("span");
                status.innerHTML = label.name;
                status.setAttribute("class", "issue-status");
                status.setAttribute("style", "background: #"+label.color);
                name.appendChild(status);
                break;
        }
    }

 }

function output_message(parent, message) {
    var o = document.createElement("div");
    o.setAttribute("class", "table-message");
    o.innerHTML = message;
    parent.appendChild(o);
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

function new_chapter_container(parent_container, chapter_name, chapter_owner) {
    var container = document.createElement("div");
    container.setAttribute("class", "chapter");
    parent_container.appendChild(container);

    return container;
}

function new_chapter_header(chapter_container, chapter_name, chapter_owner) {
    var header_container = document.createElement("div");
    header_container.setAttribute("class", "table-header");
    header_container.setAttribute("id", chapter_name);
    chapter_container.appendChild(header_container);

    var title = document.createElement("a");
    title.setAttribute("href", "https://github.com/w3c/svgwg/issues?q=is%3Aissue+label%3A%22"+encodeURI(chapter_name)+"%22");
    title.innerHTML = escapeXML(chapter_name);
    header_container.appendChild(title);
    
    var metadata_container = document.createElement("div");
    metadata_container.setAttribute("id", "metadata");
    header_container.appendChild(metadata_container);

    var owner = document.createElement("div");
    owner.setAttribute("class", "chapter-owner");
    owner.innerHTML = chapter_owner;
    header_container.appendChild(owner);

    return header_container;
}

function new_issue_list(chapter_container) {
    var list = document.createElement("ul");
    list.setAttribute("class", "table-body");
    chapter_container.appendChild(list);

    return list;
}

function output_chapter_metadata(chapter_header, nopen, nclosed) {
    var open = document.createElement("span");
    open.setAttribute("class", "num-open");
    open.innerHTML = nopen + " Open";

    var closed = document.createElement("span");
    closed.setAttribute("class", "num-closed");
    closed.innerHTML = nclosed + " Closed";

    var metadata_container = chapter_header.querySelector("#metadata");
    metadata_container.appendChild(open);
    metadata_container.appendChild(closed);
}

function output_list(issues) {
    var chapter_names = Object.keys(chapters);

    for (var issue of issues) {
        for (var label of issue.labels) {
            //if (chapter_names.includes(label.name)) {
            if (chapter_names.indexOf(label.name) > -1) {
                chapters[label.name].issues.push(issue);
            }
        }    
    }

    var total_open = 0;

    for (var chapter_name of chapter_names) {
        var chapter = chapters[chapter_name];
        var chapter_container = new_chapter_container
                                (
                                    document.querySelector("#issues"),
                                    chapter_name,
                                    chapter.owner
                                );
        var header = new_chapter_header(chapter_container, chapter_name, chapter.owner);
        var open = 0;
        var closed = 0;

        if (chapter.issues.length > 0) {
            var open_issues = new_issue_list(chapter_container);
            var closed_issues = undefined;
    
            for (var issue of chapter.issues) {
                if (issue.state == "open") {
                    open ++;
                    output_issue_to_list(open_issues, issue);
                } else {
                    if (closed_issues === undefined)
                       closed_issues = new_issue_list(chapter_container);
                    closed ++;
                    output_issue_to_list(closed_issues, issue);
                }
            }
            output_chapter_metadata(header, open, closed);
        } else {
            output_message(chapter_container, "No issues");
        }
        output_chapter_summary(chapter_name, chapter.owner, open, closed);
        total_open += open;
    }

    output_chapter_summary("Total", "", total_open, 0);
}

function display(issues) {
    output_list(issues);
    document.querySelector("#loading").style.opacity = 0;
    document.querySelector("#issue-summary").style.opacity = 1;
    document.querySelector("#issues").style.opacity = 1;
}

function get_json_issues(prev_issues, page) {
    
    if (prev_issues === undefined) prev_issues = [];
    if (page === undefined) page = 1;

    console.log('getting issues for page ' + page);
    httpGetAsync(
        'https://api.github.com/repos/w3c/svgwg/issues?state=all&sort=created&direction=asc&milestone=1&page='+page,
        issue_json_received,
        { "prev_issues": prev_issues, "page": page}
    );
}

function issue_json_received(responseText, user_data) {

    document.querySelector("#progress").setCurrentTime(0.0);

    var prev_issues = user_data.prev_issues;
    var page = user_data.page;
    var issues = JSON.parse(responseText);
    if (issues.length > 0) {
        get_json_issues(prev_issues.concat(issues), page + 1);
    } else {
        display(prev_issues);
    }
}

window.onload=function() {
    get_json_issues();
}
