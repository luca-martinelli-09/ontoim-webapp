#!/bin/bash
# This file generates run time the configurations file from following environment variables


LODVIEW_TBOXSPACE=${LODVIEW_TBOXSPACE:-"http://w3id.org/g0v/it/mef#"}
LODVIEW_TBOXPREFIX=${LODVIEW_TBOXPREFIX:-app}        
LODVIEW_URISPACE=${LODVIEW_URISPACE:-http://mef.linkeddata.cloud/resource/}
LODVIEW_URISPACEPREFIX=${LODVIEW_URISPACEPREFIX:-resource}        
LODVIEW_AUTHUSERNAME=${LODVIEW_AUTHUSERNAME:-""}
LODVIEW_AUTHPASSWORD=${LODVIEW_AUTHPASSWORD:-""}
LODVIEW_SPARQLENDPOINT=${LODVIEW_SPARQLENDPOINT:-https://data.budget.g0v.it/sparql}
LODVIEW_HOMEURL=${LODVIEW_HOMEURL:-http://linkeddata.center/}
LODEVIEW_HEADERLOGO=${LODEVIEW_HEADERLOGO:-"../img/logo-header-lodview@2x.png"}
LODVIEW_LANG=${LODVIEW_LANG:-auto}
LODVIEW_LICENSE=${LODVIEW_LICENSE:-""}
LODVIEW_PUBLICURLPREFIX=${LODVIEW_PUBLICURLPREFIX:-https://data.budget.g0v.it/lodview/}
LODVIEW_HOME_TITLE=${LODVIEW_HOME_TITLE:-"Welcome to LodeView Application"}
LODVIEW_HOME_ABSTRACT=${LODVIEW_HOME_ABSTRACT:-"Please try to refer the <a href='welcome'>welcome resource</a>"}
LODVIEW_HOME_DESCRIPTION=${LODVIEW_HOME_DESCRIPTION:-"This is a linked data browser of the data contained in SPARQL end point."}


## substitute %%VARNAME%% with the value of $VARNAME
## $1= template file $2 = target
function gentemplate {
    while read -r line ; do
        while [[ "$line" =~ %%([a-zA-Z_][a-zA-Z_0-9]*)%% ]] ; do
            LHS=${BASH_REMATCH[1]}
            eval RHS=\$$LHS;
            line=${line//%%$LHS%%/$RHS}
        done
        echo "$line"
    done < "$1" > "$2"
}

TEMPLATE_DIR="/templates"


# Allow renaming of loadview app
if [ "$APP_NAME" != "ROOT"  ]; then
    mv "/usr/local/tomcat/webapps/ROOT" "/usr/local/tomcat/webapps/$APP_NAME"
fi

gentemplate $TEMPLATE_DIR/config.ttl.template /usr/local/tomcat/webapps/$APP_NAME/WEB-INF/conf.ttl
gentemplate $TEMPLATE_DIR/footer.jsp.template /usr/local/tomcat/webapps/$APP_NAME/WEB-INF/views/inc/footer.jsp
gentemplate $TEMPLATE_DIR/home.jsp.template /usr/local/tomcat/webapps/$APP_NAME/WEB-INF/views/home.jsp
gentemplate $TEMPLATE_DIR/custom.css.template /usr/local/tomcat/webapps/$APP_NAME/resources/css/custom.css


catalina.sh run