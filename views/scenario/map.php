    <script type="text/javascript">
      var requestUrl = "<?php echo $url; ?>";
      var bounds = "<?php echo $initialBounds; ?>";
      var city = "<?php echo $city; ?>";
      var mapCenter = [<?php echo $mapCenter; ?>];
      $(document).ready(function(){
        $('.charts-tabs a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
          drawCharts();
        });
      });
    </script>
<div class="panel panel-default">
  <div class="panel-heading">Filters</div>
  <div class="panel-body">
    <span class="label label-default">Data:</span>
    <div class="btn-group type">
      <button type="button" class="btn btn-default" value="positive">Happy</button>
      <button type="button" class="btn btn-default" value="negative">Sad</button>
      <?php foreach ($customData as $key => $value) { ?>
        <button type="button" class="btn btn-default" value="<?php echo $value; ?>"><?php echo ucfirst($value); ?></button>  
      <?php } ?>
      <button type="button" class="btn btn-default" value="all">All</button>
    </div>
    <span class="label label-info loader">Loading...</span>
    <br/><br/>
    <span class="label label-default">By time:</span>
    <div class="btn-group">
      <button type="button" class="hour none btn btn-default" value="none">None</button>
      <?php
      for ($i=0; $i < 24; $i++) { ?>
      <button type="button" class="hour btn btn-default" value="<?php echo ($i < 10)?"0".$i:$i; ?>"><?php echo ($i < 10)?"0".$i:$i; ?></button>
      <?php }  ?>
    </div>
    <br/>
    <br/>
    <span class="label label-default">By day:</span>
    <div class="btn-group">
      <button type="button" class="day none btn btn-default" value="none">None</button>
      <?php
      foreach (array('Mon','Tue','Wed','Thu','Fri','Sat','Sun') as $key => $value) { ?>

      <button type="button" class="day btn btn-default" value="<?php echo $value; ?>"><?php echo $value; ?></button>
      <?php }  ?>
    </div><br/><br/>
    <span class="label label-default">By lang:</span>
    <div class="btn-group lang-list">
      <button type="button" class="lang none btn btn-default" value="none">None</button>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-6">
    <div class="panel panel-default">
      <div class="panel-heading"><button type="button" class="btn-xs btn btn-default bounds-box pull-right">Show bounds box</button>Map</div>
      <div id="map-canvas" style="height:500px;"></div>
    </div>
    
    
  </div>
  <div class="col-md-6">

    <div class="panel panel-default">
      <div class="panel-heading">Tweets</div>
        <ul class="list-group tweets" style="overflow:auto; max-height:500px;">

        </ul>
    </div>
  </div>
</div>
<div class="panel panel-default">
  <div class="panel-heading">Charts</div>
  <div class="charts-tabs">
  <!-- Nav tabs -->
      <ul class="nav nav-tabs">
        <li class="active"><a href="#day-tab" data-toggle="tab">Day frequencies</a></li>
        <li><a href="#hour-tab" data-toggle="tab">Hour frequencies</a></li>
        <li><a href="#lang-tab" data-toggle="tab">Lang frequencies</a></li>
      </ul>

      <!-- Tab panes -->
      <div class="tab-content">
        <div class="tab-pane active" id="day-tab">
          <div id="day-chart" ></div>
        </div>
        <div class="tab-pane" id="hour-tab">
          <div id="hour-chart" ></div>
        </div>
        <div class="tab-pane" id="lang-tab">
          <div class="checkbox">
            <label>
              <input type="checkbox" id="show-english" checked="checked">Show english
            </label>
          </div>
          <div id="lang-chart" ></div>
        </div>
      </div>  
  </div>
</div>
