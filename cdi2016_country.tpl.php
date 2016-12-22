<?php $comparison = count($countries) > 1 ? 'comparison' : '';?>

<div class="countries <?php print $comparison;?>">
    <?php foreach ($countries as $node) {
        $length = count($countries);
        $width = (100/$length) . '%';
        $content = node_view($node, 'teaser');
        $country_code = strtolower($node->country_code);
        

        if (empty($comparison)) {
            $style = '';
            if (!empty($node->field_hero_image['und'])) {
                $image_url = file_create_url($node->field_hero_image['und'][0]['uri']);
                $style = 'background-image:url(' . $image_url . ')';
            }
        ?>
        <div class="country-title" style="<?php print $style;?>">
            <h2><?php print t($node->title);?>—Commitment to Development Index</h2>
        </div>
        <?php } ?>
        <div class="country-wrapper">
            <div class="country-details <?php print $country_code;?>" style="width:<?php print $width;?>">
                <?php if (!empty($comparison)) {
                    $image_url = file_create_url($node->field_hero_image['und'][0]['uri']);
                ?>
                <div class="country-title" style="<?php print $style;?>">
                    <h2><?php print t($node->title);?>—Commitment to Development Index</h2>
                </div>
                <?php } ?>
                <p>The Commitment to Development Index ranks 27 of the world’s richest countries on policies that affect people living in poorer nations. The CDI adjusts for size and economic weight to measure countries according to their potential to help. This is the country report for <?php print t($node->title);?>. For results of all countries, visit <a href="/commitment-development-index">the main CDI page</a>.</p>
                <?php foreach ($indicators as $indicator => $field) { ?>
                <div class="indicator <?php print $indicator;?>">
                    <div class="indicator-title">
                        <h3 class="<?php print strtoupper($indicator);?>-bg"><?php print $content[$field]['#title'];?></h3>
                        <span class="indicator-rank"></span>
                    </div>
                    <div class="left-side">
                        <div class="indicator-content" data-field="<?php print $field;?>"><?php print drupal_render($content[$field]);?></div>
                        <div class="line-chart"></div>
                    </div>
                    <div class="right-side">
                        <div class="average">SCORE: <span class="avg"></span></div>
                        <div class="bar-charts"></div>
                    </div>
                    <div class="clearfix"></div>
                </div>
                <?php } ?>
            </div>
        </div>
        <?php
    } ?>
<div class="clearfix"></div>
<div class="cdi-link">
    <?php print l(t('Go back to main CDI'), 'commitment-development-index-2016');?>
</div>

</div>
<?php
    $node = $countries[0];
    $content = node_view($node, 'teaser');
    $description_overall = strip_tags(drupal_render($content['field_overall']));
    $description_overall_encoded = rawurlencode($description_overall);
    $title_encoded = rawurlencode($node->title);
    $url_encoded = rawurlencode($GLOBALS['base_url'].'/'.current_path());
?>
<div class="social">
    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php print $url_encoded;?>" class="facebook" target="fb "title="Share on Facebook">Facebook</a>
    <a href="http://twitter.com/share?text=<?php print $description_overall_encoded;?>&url=<?php print $url_encoded;?>&via=cgdev" class="twitter" target="tw" title="Share on Twitter">Twitter</a>
    <a href="mailto:?subject=Commitment%20to%20Development%20Index%20-%20<?php print $title_encoded;?>&body=<?php print $description_overall_encoded;?>%0A%0A<?php echo $GLOBALS['base_url'].'/'.current_path();?>" target="em" class="email" title="Share by email">Email</a>
</div>