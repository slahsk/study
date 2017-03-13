var Conference = Conference || {};

Conference.attendee = function(firsName, lastName){

  var checkedIn = false,
      first = firsName || 'None',
      last = lastName || 'None';

  return {
    getFullName : function(){
      return first + ' ' + last;
    },
    isCheckedIn : function(){
      return checkedIn;
    },
    checkIn : function(){
      checkedIn = true;
    }
  };

};

Conference.attendeeCollection = function(){
    var attendees = [];

    return {
      contains : function(attendee){
        return attendees.indexOf(attendee) > -1;
      },
      add : function(attendee){
        if(!this.contains(attendee)){
          attendees.push(attendee);
        }
      },
      remove : function(attendee){
        var index = attendees.indexOf(attendee);

        if(index > -1){
          attendees.splice(index,1);
        }
      },
      iterate : function(callback){
        attendees.forEach(callback);
      }
    };
};

Conference.checkInRecorder = function(){

  return {
    recordCheckIn : function(attendee){

    }
  }
};

Conference.checkInService = function(checkInRecorder){
  var recorder = checkInRecorder;

  return {
    checkIn : function(attendee){
      attendee.checkIn();
      recorder.recordCheckIn(attendee);
    }
  };
};

Conference.checkInAttendeeCounter = function(){
  var checkedInAttendees = 0;

  var self =  {
    increment : function(){
      checkedInAttendees++;
    },
    getCount : function(){
      return checkedInAttendees;
    },
    countIfCheckdIn : function(attendee){
      if(attendee.isCheckedIn()){
        self.increment();
      }
    }
  };

  return self;
};

module.exports = Conference;
