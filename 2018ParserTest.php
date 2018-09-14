<?php
/**
 * Created by PhpStorm.
 * User: javie_000
 * Date: 6/11/2015
 * Time: 10:36 PM
 */

require_once dirname(__FILE__ ) . '/2018CdiXmlParser.php';
header('Content-Type: application/json');
$parser = new CdiXmlParser(dirname(__FILE__) . '/2018cdi-xml-full-document.xml');
echo json_encode(array('indicators' => $parser->getIndicatorsTree()));
