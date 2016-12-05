<div class="countries">
    <?php foreach ($countries as $node) {
        $length = count($countries);
        $width = (100/$length) . '%';
        $content = node_view($node, 'teaser');
        $country_code = strtolower($node->country_code);
        ?>
        <div class="country-details <?php print $country_code;?>" style="width:<?php print $width;?>">
            <div class="country-title">
                <h2><?php print t($node->title);?></h2>
            </div>
            <?php foreach ($indicators as $indicator => $field) { ?>
            <div class="indicator <?php print $indicator;?>">
                <div class="indicator-title">
                    <h3 class="<?php print strtoupper($indicator);?>-bg"><?php print $content[$field]['#title'];?></h3>
                    <span class="indicator-rank"></span>
                </div>
                <div class="left-side">
                    <div class="indicator-content"><?php print drupal_render($content[$field]);?></div>
                    <div class="line-chart"></div>
                </div>
                <div class="right-side">
                    <div class="average">AVERAGE: <span class="avg"></span></div>
                    <div class="bar-charts"></div>
                </div>
                <div class="clearfix"></div>
            </div>
            <?php } ?>
        </div>
        <?php
    } ?>
<div class="clearfix"></div>
</div>