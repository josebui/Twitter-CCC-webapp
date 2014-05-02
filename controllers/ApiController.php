<?php 

namespace app\controllers;

use Yii;
use yii\web\Controller;

class ApiController extends Controller
{
    private $format = 'json';

    // Actions
    public function actionList()
    {
        $items = ['some', 'array', 'of', 'values' => ['associative', 'array']];
        Yii::$app->response->format = 'json';
        return $items;
    }
    
    public function actionView()
    {
    }
    public function actionCreate()
    {
    }
    public function actionUpdate()
    {
    }
    public function actionDelete()
    {
    }
}