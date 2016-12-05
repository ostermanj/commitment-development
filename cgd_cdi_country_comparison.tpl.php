<?php
$contents = array();
foreach ($countries as $i => $node) {
    $contents[$i] = node_view($node, 'teaser');
    $contents[$i]['country_code'] = strtolower($node->country_code);
    $contents[$i]['title_css'] = '';
    if (!empty($node->field_hero_image['und'])) {
        $image_url = file_create_url($node->field_hero_image['und'][0]['uri']);
        $contents[$i]['title_css'] = 'background-image:url(' . $image_url .')';
    }
}
?>
<div class="country-comparison">
    <div class="country-wrapper">
        <?php foreach ($countries as $i => $node) {?>
        <div class="country-info country-title" style="<?php print $contents[$i]['title_css'];?>">
            <h2><?php print t($node->title);?></h2>
        </div>
        <?php } ?>
    </div>
    <div class="country-wrapper">
        <?php foreach ($indicators as $indicator => $field) { ?>
            <div class="indicator <?php print $indicator;?>">
            <?php foreach ($countries as $i => $node) { ?>
                <div class="country-info country-details <?php print $contents[$i]['country_code'];?>">
                    <div class="indicator-title">
                        <h3 class="<?php print strtoupper($indicator);?>-bg"><?php print $contents[$i][$field]['#title'];?></h3>
                        <span class="indicator-rank"></span>
                    </div>
                    <div>
                        <div class="indicator-content"><?php print drupal_render($contents[$i][$field]);?></div>
                        <div class="line-chart"></div>
                    </div>
                    <div>
                        <div class="average">AVERAGE: <span class="avg"></span></div>
                        <div class="bar-charts"></div>
                    </div>
                </div>
            <?php } ?>
                <div class="clearfix"></div>
            </div>
        <?php } ?>
    </div>
<div class="clearfix"></div>
<div class="cdi-link">
    <?php print l(t('Go back to Overall'), 'cdi-2015');?>
</div>
<div class="more-info">
    <?php print l(t('Need more info'), 'cdi-2015');?>
</div>
</div>
<div class="social">
    <a href="https://www.facebook.com/sharer/sharer.php?u=http://www.cgdev.org/cdi-2015" class="facebook" target="fb "title="Share on Facebook">Facebook</a>
      <a href="http://twitter.com/share?text=Denmark%20takes%20first%20place%20on%20the%202015%20Commitment%20to%20Development%20Index.%20US%20is%20%2021st%20and%20UK%20is%2012th.&url=http%3A%2F%2Fwww.cgdev.org%2Fcdi&via=cgdev" class="twitter" target="tw" title="Share on Twitter">Twitter</a>
    <a href="mailto:?subject=Commitment%20to%20Development%20Index&body=The%20Commitment%20to%20Development%20Index%20ranks%2027%20of%20the%20world%E2%80%99s%20richest%20countries%20on%20policies%20that%20affect%20the%20more%20than%20five%20billion%20people%20living%20in%20poorer%20nations.%0A%0Ahttp%3A%2F%2Fwww.cgdev.org%2Fcdi-2015" target="em" class="email" title="Share by email">Email</a>
</div>