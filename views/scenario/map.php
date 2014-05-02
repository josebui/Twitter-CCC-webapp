    <div id="panel">
      <button onclick="toggleHeatmap()">Toggle Heatmap</button>
      <button onclick="changeGradient()">Change gradient</button>
      <button onclick="changeRadius()">Change radius</button>
      <button onclick="changeOpacity()">Change opacity</button>
    </div>
    <div id="map-canvas" style="height:500px;"></div>
    <div>
    <?php
    for ($i=0; $i <= 24; $i++) { ?>
      <span class="hour"><?php echo ($i < 10)?"0".$i:$i; ?></span>
    <?php }  ?>
    </div>