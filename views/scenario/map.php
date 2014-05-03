    <div class="btn-group type">
      <button type="button" class="btn btn-default" value="happy">Happy</button>
      <button type="button" class="btn btn-default" value="sad">Sad</button>
    </div>
    <span class="label label-info loader">Loading...</span>
    <br/><br/>
    <div id="map-canvas" style="height:500px;"></div>
    <br/>
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
    </div>
