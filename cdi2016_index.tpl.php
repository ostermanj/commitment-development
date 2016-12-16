<div class="cdi-header-wrapper">
    <div class="cdi-header">
        <h1>The Commitment to Development Index</h1>
        <div id="cdi-carousel-wrapper">
          
            <p id="cdi-carousel-0" class="cdi-carousel" style="position: relative;">The Commitment to Development Index ranks 27 of the world’s richest countries on their dedication to policies that benefit people living in poorer nations.</p>
            <p id="cdi-carousel-1" class="cdi-carousel" style="visibility: hidden; opacity:0">The CDI adjusts for size and economic weight to measure countries according to their potential to help. </p>
            <p id="cdi-carousel-2" class="cdi-carousel" style="visibility: hidden; opacity:0">Denmark and Finland take first place in a tie. Sweden, France, and Portugal complete the top five.</p>
            <p id="cdi-carousel-3" class="cdi-carousel" style="visibility: hidden; opacity:0">The United Kingdom is tied for eighth place with strengths in <em>aid</em> and <em>trade</em>. The United States takes 21st place, with low scores on <em>environment</em> and <em>security</em>.</p>
            <p id="cdi-carousel-4" class="cdi-carousel" style="visibility: hidden; opacity:0">Switzerland comes in last with poor showings in <em>finance</em>, <em>environment</em>, and <em>trade</em>.</p>
            <p id="cdi-carousel-5" class="cdi-carousel" style="visibility: hidden; opacity:0">Explore all the results below. Adjust weights to see the effect on scores. Unstack the graph to make easier comparisons. Select countries for trends and components for more details.</p>
            
        </div>
        <div id="carousel-indicator-wrapper">
          <div id="carousel-indicator"></div>
        </div>
    </div>
</div>
<div class="dev-cdi">
    <div id="new_cdi">
      <table id="home-cdi">
        <thead>
          <tr>
            <td style="position:relative;">
		<span class="tie-notation" style="color:#888;margin-bottom:-10px;font-size:12px;text-align:left">* = TIE</span>
		<a href="#" class="sorting asc" data-field="rank">Rank</a>
	    </td>
            <td><a href="#" class="sorting" data-field="country">Country</a></td>
            <td>Score</td>
            <td>Policies</td>
            <td class="spacer"></td>
            <td id="unstack-td" colspan="2"><span>Stack graph</span><div class="unstack-slider"><button class="slider-selector"></button></div></td>  
            
          </tr>
        </thead>
        <tbody>
        </tbody>
	
      </table>
      <table id="home-cdi-indicator" style="display: none">
        <thead>
<!--	  <tr>
		<td  colspan=6 id="indicator-description">
		</td>
	  </tr>-->
          <tr>
            <td><a href="#" class="sorting asc" data-field="rank">Rank</a></td>
            <td><a href="#" class="sorting" data-field="country">Country</a></td>
            <td>Score</td>
            <td>Indicators</td>
            <td class="spacer"></td>
            <td class="indicator-unstack" colspan="2"></td>
              
            
          </tr>
        </thead>
        <tbody>
        </tbody>
	<!--<tfoot>
	  <tr>
                <td  colspan=6 id="indicator-explanation">
                </td>
          </tr>
	</tfoot> -->
      </table>
        <div id="indicator-description-wrapper">
            <div id="indicator-description"></div>
            <div id="indicator-explanation"></div>
        </div>
    </div>
<!--Title for country details section-->
<div id="div_new_title" style="font-size: 24px;margin: 0 0 16px 0;min-width:920px;"></div>
<div class="clear"></div>
<!--Details Section-->
<div class="mainxx" id="data" style="clear:both"></div>
<!-- /Details Section -->
<p>
</div>
<?php $url_encoded = rawurlencode($GLOBALS['base_url'].'/'.current_path()); ?>
<div class="social">
    <a href="https://www.facebook.com/sharer/sharer.php?u=<?php print $url_encoded; ?>" class="facebook" target="fb" title="Share on Facebook">Facebook</a>
    <a href="http://twitter.com/share?text=Denmark%2C%20Sweden%2C%20and%20Finland%20take%201st%20place%20on%20the%20Commitment%20to%20Development%20Index&url=<?php print $url_encoded; ?>&via=cgdev" class="twitter" target="tw" title="Share on Twitter">Twitter</a>
     <a href="mailto:?subject=Commitment%20to%20Development%20Index&body=The%20Commitment%20to%20Development%20Index%20ranks%2027%20of%20the%20world%E2%80%99s%20richest%20countries%20on%20policies%20that%20affect%20the%20more%20than%20five%20billion%20people%20living%20in%20poorer%20nations.%0A%0A<?php echo $GLOBALS['base_url'].'/'.current_path();?>" target="em" class="email" title="Share by email">Email</a>
</div>
