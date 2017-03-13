// This is only meant to work on the Thanks page
var myUUID = localStorage.getItem('uuid'),
    pendingState = 'initial',
    stateElements = {
      pending: $('.pending-state'),
      timeout: $('.timeout-state'),
      error  : $('.error-state'),
      success: $('.success-state')
    },
    advancePendingState = function() {
      switch(pendingState) {
        case 'initial':
          pendingState = 'second';
          $('.pending-state__initial').hide();
          $('.pending-state__second').show();
          break;
        case 'second':
          pendingState = 'third';
          $('.pending-state__second').hide();
          $('.pending-state__third').show();
          break;
        case 'third':
          // this is taking too long
          pendingState = 'timeout'
          stateElements.pending.hide();
          stateElements.timeout.show();
          clearInterval(pendingTimer);
          break;
      }
    },
    doLookup = function(uuid) {
      $.ajax({
        url: 'https://qiny3w62f7.execute-api.us-east-1.amazonaws.com/prod/build-proposal-calculator',
        data: {
          uuid: myUUID
        },
        headers: {
          'X-Access-Key': 'Ktu90SCFl%t4YFWuk31&7#QTH'
        }
      }).done(function(data) {
        clearInterval(pendingTimer);

        if(pendingState === 'timeout') {
          stateElements.timeout.hide();
        } else {
          stateElements.pending.hide();
        }

        $('.js__estimate').text('$' + data.predicted_cost.toLocaleString());
        localStorage.removeItem('uuid');
        stateElements.success.show();
      }).fail(function(xhr, status) {
        if(xhr.status === 404) {
          return doLookup();
        }
        if(pendingState === 'timeout') {
          stateElements.timeout.hide();
        } else {
          stateElements.pending.hide();
        }

        stateElements.error.show();
        clearInterval(pendingTimer);
      });
    },
    pendingTimer;

if(!myUUID) {
  stateElements.pending.hide();
  stateElements.error.show();
} else {
  doLookup();
  pendingTimer = setInterval(advancePendingState, 6000);
}
