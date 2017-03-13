var Conference = require('../lib/5.js');

describe('Conference.attendeeCollection',function(){
  describe('contains(attendee)',function(){

  });

  describe('add(attendee)',function(){

  });

  describe('remove(attendee)',function(){

  });


  describe('iterate(callback)',function(){
    var collection, callbackSpy;

    function addAttendeeToCollection(attendeeArray){
      attendeeArray.forEach(function(attendee){
        collection.add(attendee);
      });
    }

    function verifyCallbackWasExcuteredForEachAttendee(attendeeArray){

      expect(callbackSpy.calls.count()).toBe(attendeeArray.length);

      var allCalls = callbackSpy.calls.all();

      for(var i = 0 ; i < allCalls.length; i++){
        expect(allCalls[i].args[0]).toBe(attendeeArray[i]);
      }
    }

    beforeEach(function(){
      collection = Conference.attendeeCollection();
      callbackSpy = jasmine.createSpy();
    });

    it('빈 컬렉션에서는 콜백을 실행하지 않는다',function(){
      collection.iterate(callbackSpy);
      expect(callbackSpy).not.toHaveBeenCalled();
    });

    it('컬렉션 원소마다 한 번씩 콜백을 실행한다.',function(){
      var attendees = [
        Conference.attendee('Tom','Kazansky'),
        Conference.attendee('Charlotte','Blackwood'),
        Conference.attendee('옹','킴')
      ];

      addAttendeeToCollection(attendees);

      collection.iterate(callbackSpy);

      verifyCallbackWasExcuteredForEachAttendee(attendees);


    });

  });
});

describe('Conference.checkInService',function(){
  var checkInService,
      checkInRecorder,
      attendee;

    beforeEach(function(){
      checkInRecorder = Conference.checkInRecorder();
      spyOn(checkInRecorder, 'recordCheckIn');

      checkInService = Conference.checkInService(checkInRecorder);

      attendee = Conference.attendee('길동','홍');
    });

    describe('checkInService.checkIn(attendee)',function(){
        it('참가자를 체크인 처리한 것으로 표시한다',function(){
            checkInService.checkIn(attendee);

            expect(attendee.isCheckedIn()).toBe(true);
        });
    });
});


describe('Conference.checkInAttendeeCounter',function(){
  var counter;

  beforeEach(function(){
    counter = Conference.checkInAttendeeCounter();
  });

  describe('increment()',function(){

  });

  describe('getCount()',function(){

  });

  describe('countIfCheckdIn(attendee)',function(){
    var attendee;

    beforeEach(function(){
      attendee = Conference.attendee('길동','홍');
    });

    it('참가자가 체크인하지 않으면 인원수를 세지 않는다',function(){
      counter.countIfCheckdIn(attendee);

      expect(counter.getCount()).toBe(0);
    });

    it('참가자가 체크인하면 인원수를 센다',function(){
      attendee.checkIn();
      counter.countIfCheckdIn(attendee);
      expect(counter.getCount()).toBe(1);
    });

    it('this가 꼭 checkedInAttendeeCounter 인스턴스를 가리키는 것은 아니다',function(){
      attendee.checkIn();

      counter.countIfCheckdIn.call({},attendee);
      expect(counter.getCount()).toBe(1);
    });
  });


});
