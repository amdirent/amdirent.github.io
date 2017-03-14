// This is only meant to work on the Thanks page
var myUUID = localStorage.getItem('uuid'),
    pendingState = 'initial',
    stateElements = {
      pending: $('.pending-state'),
      timeout: $('.timeout-state'),
      error  : $('.error-state'),
      success: $('.success-state')
    },
    fadeBetween = function(fromEl, toEl) {
      fromEl.fadeOut(100, function() {
        toEl.fadeIn(100);
      });
    },
    advancePendingState = function() {
      switch(pendingState) {
        case 'initial':
          pendingState = 'second';
          fadeBetween($('.pending-state__initial'),
                      $('.pending-state__second'));
          break;
        case 'second':
          pendingState = 'third';
          fadeBetween($('.pending-state__second'),
                      $('.pending-state__third'));
          break;
        case 'third':
          // this is taking too long
          pendingState = 'timeout'
          fadeBetween(stateElements.pending,
                      stateElements.timeout);
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
        var toHide;
        clearInterval(pendingTimer);

        if(pendingState === 'timeout') {
          toHide = stateElements.timeout;
        } else {
          toHide = stateElements.pending;
        }

        $('.js__estimate').text('$' + data.predicted_cost.toLocaleString());
        localStorage.removeItem('uuid');
        fadeBetween(toHide, stateElements.success);
      }).fail(function(xhr, status) {
        var toHide;
        if(xhr.status === 404) {
          return doLookup();
        }
        if(pendingState === 'timeout') {
          toHide = stateElements.timeout;
        } else {
          toHide = stateElements.pending;
        }

        fadeBetween(toHide, stateElements.error);
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
