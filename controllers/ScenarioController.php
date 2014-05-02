<?php 

namespace app\controllers;

use Yii;
use yii\web\Controller;

class ScenarioController extends Controller
{

    public function beforeAction($action)
    {
        // echo "<pre>".print_r($action,true)."</pre>";
        switch($action->id){
            case 'map':
                Yii::$app->view->registerJsFile('https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=visualization');
                Yii::$app->view->registerJsFile('js/scenario/map.js');
            break;
        }

        return true;
    }

    // Actions
    public function actionMap()
    {
        // Yii::$app->view->registerJsFile('js/1.js');
        return $this->render('map');
    }

}