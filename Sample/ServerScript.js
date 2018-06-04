private function getRandom(start,end){
    return parseInt(Math.round(Math.random()*(end-start)+start));
}
public function random9(number,bet){
    var balance=getBalance();
    var price=parseFloat(bet);
    if(price<=0){
        return [1,'Wrong request!'];//1:Error
    }
    if(balance < price){
        return [1,'Player not enough money!'];//1:Error
    }
    var ranNumber=getRandom(1,9);
    var win=0;    
    var yournumber=parseInt(number);
    var score=getUserScore('random9_score');//Get the current score
    if(yournumber==ranNumber){
       win=5*price;
       if(!chargeMoney(-win)){
           return [2,'Game is out of cash!'];//2:Error game is not enough money for player
       }
      if(score==null){
          score=0;
      }
       score=score+5; //increase score
          saveUserScore('random9_score',score);
    }
    else{    
       win=-price;
       if(!chargeMoney(price)){
           return [1,'Player not enough money!'];//1:Error
       }  
      if(score==null){
            saveUserScore('random9_score',score);
      }
    }  
    setSessionStore('GAME-9');
    newUserSession();
    saveUserSessionData('rand',ranNumber+","+yournumber+","+win);
    return [0,ranNumber,yournumber,win,balance];//Success
}
public function lowhighgame(islow,symbol,bet)
{
    var price=parseFloat(bet);
    symbol=parseInt(symbol);
    if(price<=0||(symbol<3)||(symbol>13)){
        return [1,'Wrong request!'];//1:Error
    }
    var balance=getBalance();
    if(balance<price){
        return [1,'Player not enough money!'];
    }
    var random_symbol=getRandom(2,14);
    var suit=getRandom(0,3);
    var card={"symbol":random_symbol,"suit":suit};
    var money=0;
    if(islow=='1')
    {
       if(symbol<random_symbol)
       {
         //Lose
         money=-price;
       }
       else if(symbol>random_symbol)
       {
         //Win
          money=price*(parseFloat(14-symbol)/(symbol-2));
       }
    } 
    else
    {
       if(symbol<random_symbol)
       {          
         money=price*((symbol-2)/parseFloat(14-symbol));
         //Win
       }
       else if(symbol>random_symbol)
       {
         //Lose
         money=-price;
       }
    }
    if(money!=0){
        if(!chargeMoney(-money)){
    		return [2,'Can not charge money. May be game is out of cash!'];
        }
      	if(money>0){
          increaseUserScore('lowhighgame_score',money);
        }
    }
  	setSessionStore('LOWHIGHGAME',);
    newUserSession();
    saveUserSessionData('result',[islow,symbol,card.symbol,money]);
    return [0,card,money];
}