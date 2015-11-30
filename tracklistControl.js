app.controller('track-list',function($scope,$timeout){
    $scope.showTrack = 0;
    $scope.show_share_dialog = 0;
    $scope.selected_song="";
    $scope.selected_song_name="";
    $scope.time_max;
    $scope.time_str="";
    $scope.timer;
    $scope.current_time = 0;
    
    $scope.process_time = function()
     {
          $('#slider-2').slider( "option", "max",$scope.time_max+1);
          $scope.timer = $timeout(function(){
                    var hours    = parseInt($scope.current_time/60);
                    var minutes  = $scope.current_time%60;
                    if(parseInt(minutes/10)==0)
                    {
                        $scope.time_str = hours+":0"+minutes;
                    }
                    else
                    {
                        $scope.time_str = hours+":"+minutes;
                    }
                    $scope.current_time++;
                    $scope.$apply();
                    $("#slider-2").slider( "option", "value",$scope.current_time);
                    if($scope.current_time<=$scope.time_max)
                    {
                       $scope.process_time();
                    }
                    else
                    {
                        $scope.current_time = 0;
                        $scope.next();
                    }
                    
                },1000);   
              
  
     }
    
    $scope.csv_load_state = function()
       {
         if(fs.existsSync('c:\\song_data.csv'))
           {
                var data = fs.readFileSync('c:\\song_data.csv');
                var str = data.toString();
                var values = str.split(/[,/n]/);
                var obj;
                var sngs = [];
                for(i=0;i<values.length;i=i+3)
                   {
                       obj = {};
                       obj.name = values[i];
                       obj.path = values[i+1];
                       sngs.push(obj);
                   }
                    sngs.pop();
                    return(sngs);   
            }
            return([]);
 
       }
  
   
     $scope.seek = function()
     {
        var selection = $( "#slider-2" ).slider( "value" );
        $scope.current_time=selection;
        if($scope.selected_song=="")
        {
            $("#slider-2").slider( "option", "value",0);
            return;
        }
        $scope.$apply();
        wav_lib.seek.async(selection,function(err,result){
        });   
         
     }
     $scope.open = function(x,y)
     {
        if(path.extname(x)=='.mp3'&&y!='test.wav')
            {
                alert('ello!');
                myFunction(x);
                return;
            }
        $scope.current_time = 0;
        if($scope.selected_song!="")
        {
            $scope.pause();
            $scope.selected_song=x;
            for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==$scope.selected_song)
                {
                    $scope.selected_song_name = $scope.arr[i].name;   
                }
                
            }
             $scope.$apply();
                if(y!='test.wav')
                {
                    $scope.time_max = wav_lib.get_time($scope.selected_song);
                    wav_lib.open.async($scope.selected_song,function(err,result){
                    });
                }
                else
                {
                    $scope.time_max = wav_lib.get_time(y);
                    wav_lib.open.async(y,function(err,result){
               
                        });
                }
            $scope.process_time();     
            return;
               
            
        }
         $scope.selected_song=x;
         for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==$scope.selected_song)
                {
                    $scope.selected_song_name = $scope.arr[i].name;   
                }
                
            }
  
         $scope.$apply();
     

         if(y!='test.wav')
            {
                $scope.time_max = wav_lib.get_time($scope.selected_song);
                wav_lib.open.async($scope.selected_song,function(err,result){
                            });
             }
            else
            {
                $scope.time_max = wav_lib.get_time(y);
                wav_lib.open.async(y,function(err,result){
                });
                }
         $scope.process_time();   
    
         
     }
     $scope.arr = $scope.csv_load_state();
     if($scope.arr.length>0)
     {
        $scope.showTrack=1;   
         
     }
     arr=$scope.arr;
     $scope.play = function()
     {
        $scope.process_time();
        if($scope.selected_song=="")
        {
            alert('please select a song first!!');   
            return;
        }
        else
        {
            
            wav_lib.play.async(function(err,result){
                 
            });
        }
       
     }
 
     $scope.pause = function()
     {
        $timeout.cancel($scope.timer);
         if($scope.selected_song=="")
            {
                
                return;
            }
         wav_lib.pause();
       
     }
     $scope.next = function()
     {
      
       for(i=0;i<$scope.arr.length;i++)
        {
            
            if($scope.arr[i].path==$scope.selected_song)
            {
                 if(i==$scope.arr.length-1)
                    {
                        
                        return;
                    }
                $scope.selected_song = $scope.arr[i+1].path;
                $scope.selected_song_name = $scope.arr[i+1].name;
                $scope.pause();
                $scope.current_time = 0; 
                //$scope.time_max = wav_lib.get_time($scope.selected_song);
                $scope.process_time();
                sel($scope.selected_song);
                break;
            }
            
        }
     }
     $scope.prev = function()
     {
      
       for(i=0;i<$scope.arr.length;i++)
        {
            if($scope.arr[i].path==$scope.selected_song)
            {
                  if(i==0)
                    {
                        return;
                    }
                $scope.selected_song = $scope.arr[i-1].path;
                $scope.selected_song_name = $scope.arr[i-1].name;
                $scope.pause();
                $scope.current_time = 0; 
               // $scope.time_max = wav_lib.get_time($scope.selected_song);
                $scope.process_time();
                sel($scope.selected_song);
                break;
            }
            
        }
     }
 
     $scope.fileName;
       $scope.add = function()
       {
         document.getElementById('FileOpener').click();
       }
       $scope.selected_file = function(x)
       {
            for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].name==x.name)
                {
                    alert('Song Already present in track list!!!');   
                    return;
                }
            }
            console.log(path.extname(x.name));
            if(path.extname(x.name)!='.mp3'&&path.extname(x.name)!=".wav")
            {
                alert('Waveplayer can only play mp3 and .wav files');
                return;
            }
            $scope.arr.push(x);
            $scope.showTrack = 1;
            $scope.csv_save_state();
           
       }
     
       
       $scope.csv_save_state = function()
       {
           $scope.file_data =""; 
           if($scope.arr.length!=0)
            {
                for(i=0;i<$scope.arr.length;i++)
                {
                    $scope.file_data+=$scope.arr[i].name+",";
                    $scope.file_data+=$scope.arr[i].path+"/n";
                }
                console.log($scope.file_data);
                fs.writeFileSync('c:\\song_data.csv',$scope.file_data);
            
            }
           else
           {
                fs.writeFileSync('c:\\song_data.csv',$scope.file_data);
           }
           
           
       }
       $scope.set_song_name = function(x)
       {
           $scope.selected_song = x;
           $scope.$apply();
       }
       $scope.rem = function(x)
       {
            for(i=0;i<$scope.arr.length;i++)
            {
                if($scope.arr[i].path==x)
                {
                    $scope.arr.splice(i,1);
                    $scope.$apply();
                    $scope.csv_save_state();
                }
                if($scope.arr.length==0)
                {
                   $scope.showTrack = 0;
                    $scope.$apply();
                }
                
            }
        
       }
       $(document).ready(function(){
   
            $( "#slider-2" ).slider({
               value: 0,
               animate:"slow",
               orientation: "horizontal"
            })
});

    
});
