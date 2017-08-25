<?php
require 'ChromePhp.php';
/**
 * Created by PhpStorm.
 * User: javie_000
 * Date: 5/11/2015
 * Time: 3:50 PM
 */

class CdiXmlParser {

    const ROOT_INDICATOR = 'CDI';
    const FILE_NOT_FOUND = 10;

    private $_fileLoaded = false;
    protected $filename;

    /** @var SimpleXmlElement $xml */
    protected $xml = null;

    /** @var array $xml */
    protected $indicatorsValues = false;

    /** @var array $xml */
    protected $indicatorsTree = false;

    /** @var array $xml */
    protected $indicatorsList = false;

    /** @var array $xml */
    protected $weightedList = false;
    protected $userFriendlyList = false;

    /** @var array $xml */
    protected $countryList = false;

    /**
     * @param $file The path of the xml to parse
     */
    function __construct($file) {
        $this->filename = $file;
    }

    /**
     * @throws Exception
     */
    protected function loadData() {
        if (true === $this->_fileLoaded)
            return;

        if (file_exists($this->filename)) {
            $rawData = file_get_contents($this->filename);
            $this->_fileLoaded = $rawData !== false;
            $this->xml = new SimpleXMLElement($rawData);
        } else {
            throw new Exception('File not found', SELF::FILE_NOT_FOUND);
        }
    }

    /**
     * @return array
     */
    public function getCountryList() {
        if (false !== $this->countryList)
            return $this->countryList;

        $this->loadData();
        $this->countryList = array();
        foreach ($this->xml->xpath('/data/country') as $country) {
            $this->countryList[$country['code']] = (string) $country;
        }
       
        unset($this->countryList['EU']);
        return $this->countryList;
        
    }
    
   protected function loadIndicatorsValues() {
        if (false !== $this->indicatorsValues)
            return $this->indicatorsValues;

        $this->loadData();
        $this->indicatorsValues = array();
        $this->weightedList = array();
        $this->userFriendlyList = array();
        $this->summaries = array();
        
        foreach ($this->xml->xpath('/data/summary') as $summary) {
            $this->summaries[(string) $summary['code']] = (string) $summary;
        }
     
        foreach ($this->xml->xpath('//vs') as $value) { // for each <vs> tag in the XML
            $indicator = (string) $value['i'];  // for example 'SEC_ARM'
            $year = intval($value['y']); // for example 2016
            $format = isset($value['format']) ? (string) $value['format'] : 'score'; // if format is specified, use that. if not use 'score'. for example: 'percentage'
            if ( isset($value['units']) ) {
                ChromePhp::log((string) $value['units']);
            }
            $this->indicatorsValues[$indicator]['units'] = isset($value['units']) ? (string) $value['units'] : null;
            $this->indicatorsValues[$indicator]['less_is_better'] = isset($value['lessisbetter']) ? intval($value['lessisbetter']) : 0;
            switch ($format) {
                case 'percentage' :
                    $formatter = new NumberFormatter('en-US', NumberFormatter::PERCENT);
                    $formatter->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, isset($value['precision']) ? intval($value['precision']) : 1);
                    break;
                case 'currency' :
                    $formatter = new NumberFormatter('en-US', NumberFormatter::CURRENCY);
                    $formatter->setAttribute(NumberFormatter::FRACTION_DIGITS, 2);
                    break;
                default:
                    $formatter = new NumberFormatter('en-US', NumberFormatter::DECIMAL);
                    $formatter->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, isset($value['precision']) ? intval($value['precision']) : 2);
                    $searchFor = 'CDI_';
                    $pos = strpos($indicator, $searchFor);
                    if ( $pos !== false ) {
                        $formatter->setAttribute(NumberFormatter::FRACTION_DIGITS, 2);
                    }
                    break;
            }

            foreach ($value->v as $entry) {
                $country = (string) $entry['c'];
                if ($country == 'EU')
                    continue;
                $floatValue = floatval(isset($entry['score']) ? $entry['score'] : $entry['value']); 
                $this->indicatorsValues[$indicator][$year][$country] = isset($value['precision']) ? round($floatValue,intval($value['precision'])) : $floatValue;

                $printedValue = '';
                if ('currency' === $format) {
                    $printedValue = $formatter->formatCurrency($this->indicatorsValues[$indicator][$year][$country], 'USD');
                } else {
                    $printedValue = $formatter->format($this->indicatorsValues[$indicator][$year][$country]);
                    
                }
                if (isset($entry['isnull'])){
                    $printedValue = (string) $entry['value'];
                }
                
                // xml data now puts empty value instead of "null" and adds isnull attribute instead
                // is isnull is set, changes printedvalue. value is parse d as zero. null value was
                // messing up the calculation of min and max, which was returning zero because of the
                // mixed types
               
                $this->userFriendlyList[$indicator][$year][$country] = $printedValue;

                if (isset($entry['weighted']) && floatval($entry['weighted'])) {


                    $this->weightedList[$indicator][$year][$country] = floatval($entry['weighted']);
                }
            }
            if (isset($value['lessisbetter']) && intval($value['lessisbetter']) == 1) {
                asort($this->indicatorsValues[$indicator][$year]);
            } else {
                arsort($this->indicatorsValues[$indicator][$year]);
            }
        }
        ChromePhp::log($this->indicatorsValues);
    }

    private function _transpose2DArray($array) {
        $newArray = array();
        foreach ($array as $i => $x) {
            foreach ($x as $j => $y) {
                $newArray[$j][$i] = $y;
            }
        }
        return $newArray;
    }

    private function roundToFraction($val, $round) {
        
    }

    private function _iterateIndicators($xmlElement, $parent = false, $level = 1) {
        $indicators = array();
        $year = (string) $this->xml['year'];
ChromePhp::log('_iterateIndicators');
        foreach ($xmlElement->indicator as $item) {
            $code = (string) $item['code'];


            $format = isset($item['format']) ? (string) $item['format'] : 'score';
            switch ($format) {
                case 'percentage' :
                    $formatter = new NumberFormatter('en-US', NumberFormatter::PERCENT);
                    $formatter->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, isset($value['precision']) ? intval($value['precision']) : 1);
                    break;
                case 'currency' :
                    $formatter = new NumberFormatter('en-US', NumberFormatter::CURRENCY);
                    $formatter->setAttribute(NumberFormatter::FRACTION_DIGITS, 2);
                    break;
                default:
                    $formatter = new NumberFormatter('en-US', NumberFormatter::DECIMAL);
                    $formatter->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, isset($value['precision']) ? intval($value['precision']) : 2);
                   
                    break;
            }
            //$unit = isset($item['units']) ? (string) $item['units'] : false;
            //ChromePhp::log($item);
            $realMin = min($this->indicatorsValues[$code][$year]);
            $realMax = max($this->indicatorsValues[$code][$year]);
            $searchFor = 'CDI_';
            $pos = strpos($code, $searchFor);
            if ( $pos !== false ) {
                if ($realMin > 0) {
                    $realMin = 0;
                }
            }
            $min = $realMin;
            $max = $realMax;

            if ('currency' === $format) {
                $friendlyMin = $formatter->formatCurrency($min, 'USD');
                $friendlyMax = $formatter->formatCurrency($max, 'USD');
            } else {
                $friendlyMin = $formatter->format($min);
                $friendlyMax = $formatter->format($max);
            }
            $less_is_better_boolean = ( $this->indicatorsValues[$code]['less_is_better'] == 1 );
            $indicators[$code] = array(
                'label' => (string) $item->label,
                'unit' => &$this->indicatorsValues[$code]['units'],
                'less_is_better' => $less_is_better_boolean,
                'decimal_places' => intval((string) $item->decimalplaces),
                'description' => isset($item->description) ? (string) $item->description : false,
                'short_label' => isset($item->shortlabel) ? (string) $item->shortlabel : false,
                'explanation' => isset($item->explanation) ? (string) $item->explanation : false,
                'level' => $level,
                'parent' => $parent,
                'format' => $format,
                'values' => &$this->indicatorsValues[$code][$year],
                'user_friendly_values' => &$this->userFriendlyList[$code][$year],
                'min' => $min,
                'max' => $max,
                'user_friendly_min' => $friendlyMin,
                'user_friendly_max' => $friendlyMax,
                
            );
            
            if ($code === 'CDI'){
                $indicators[$code]['summaries'] = $this->summaries;
            }
            if (isset($this->weightedList[$code][$year])) {
                $indicators[$code]['weighted'] = $this->weightedList[$code][$year];
            }
            if ($level === 2 || $level === 1) {
                ksort($this->indicatorsValues[$code]);
                $indicators[$code]['trends'] = $this->_transpose2DArray($this->indicatorsValues[$code]);
            }

            $this->indicatorsList[$code] = $indicators[$code];

            if (isset($item->hierarchy)) {
                $indicators[$code]['children'] = $this->_iterateIndicators($item->hierarchy, $code, $level + 1);
                $this->indicatorsList[$code]['children'] = array_keys($indicators[$code]['children']);
            }
        }
      
            

        return $indicators;
    }

    protected function loadIndicatorsInformation() {
        if (false !== $this->indicatorsTree)
            return;
        $this->loadData();
        $this->indicatorsList = array();
        $this->loadIndicatorsValues();
        $this->indicatorsTree = $this->_iterateIndicators($this->xml->hierarchy);
    }

    public function getIndicatorsPlainList() {
        if (false === $this->indicatorsList)
            $this->loadIndicatorsInformation();

        return $this->indicatorsList;
    }

    public function getIndicatorsTree() {
        if (false === $this->indicatorsTree)
            $this->loadIndicatorsInformation();

        return $this->indicatorsTree;
    }

    public function getTrendsByCountry($countryCode) {
        $this->loadIndicatorsInformation();

        $result = array();
        foreach ($this->indicatorsList[self::ROOT_INDICATOR]['children'] as $indicator) {
            $result[$indicator] = $this->indicatorsList[$indicator]['trends'][$countryCode];
        }
        return $result;
    }

    public function getXml() {
        $this->loadData();
        return $this->xml;
    }

}

