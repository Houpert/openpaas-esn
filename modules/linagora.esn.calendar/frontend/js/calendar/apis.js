'use strict';

angular.module('esn.calendar')

  .constant('CALENDAR_ACCEPT_HEADER', 'application/calendar+json')
  .constant('CALENDAR_CONTENT_TYPE_HEADER', 'application/calendar+json')
  .constant('CALENDAR_PREFER_HEADER', 'return=representation')

  .factory('pathBuilder', function(DEFAULT_CALENDAR_ID) {
    function rootPath() {
      return '/calendars';
    }

    function forCalendarHomeId(calendarHomeId) {
      return rootPath() + '/' + calendarHomeId + '.json';
    }

    function forCalendarId(calendarHomeId, calendarId) {
      return rootPath() + '/' + calendarHomeId + '/' + calendarId + '.json';
    }

    function forEventId(calendarHomeId, eventId) {
      return (rootPath() + '/' + calendarHomeId + '/' + DEFAULT_CALENDAR_ID).replace(/\/$/, '') + '/' + eventId + '.ics';
    }

    return {
      rootPath: rootPath,
      forCalendarHomeId: forCalendarHomeId,
      forCalendarId: forCalendarId,
      forEventId: forEventId
    };
  })

  .factory('calendarAPI', function(calendarRestangular, request, pathBuilder, CALENDAR_ACCEPT_HEADER) {

    var davDateFormat = 'YYYYMMDD[T]HHmmss';

    /**
     * Query one or more calendars for events in a specific range. The dav:calendar resources will include their dav:item resources.
     * @param  {String}   calendarHref The href of the calendar.
     * @param  {fcMoment} start        fcMoment type of Date, specifying the start of the range.
     * @param  {fcMoment} end          fcMoment type of Date, specifying the end of the range.
     * @return {Object}                An array of dav:items items.
     */
    function listEvents(calendarHref, start, end) {
      var body = {
        match: {
          start: start.format(davDateFormat),
          end: end.format(davDateFormat)
        }
      };
      return request('post', calendarHref, null, body)
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          if (!response.data || !response.data._embedded || !response.data._embedded['dav:item']) {
            return [];
          }
          return response.data._embedded['dav:item'];
        });
    }

    /**
     * Query a calendar, searching for indexed events depending on the query. The dav:calendar resources will include their dav:item resources.
     * @method searchEvents
     * @param  {[type]} calendarId     The calendar id.
     * @param  {[type]} options        The query parameters {query: '', limit: 20, offset: 0}
     * @return {Object}                An array of dav:item items.
     */
    function searchEvents(calendarId, options) {
      return calendarRestangular.one(calendarId).one('events.json').get({query: options.query, limit: options.limit, offset: options.offset})
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          if (!response.data || !response.data._embedded || !response.data._embedded['dav:item']) {
            return [];
          }
          return response.data._embedded['dav:item'];
        });
    }

    /**
     * Query one or more calendars for events. The dav:calendar resources will include their dav:item resources.
     * @param  {String}   calendarHomeId The calendarHomeId.
     * @param  {String}   calendarId     The calendarId.
     * @param  {fcMoment} start          fcMoment type of Date, specifying the start of the range.
     * @param  {fcMoment} end            fcMoment type of Date, specifying the end of the range.
     * @return {Object}                  An array of dav:item items.
     */
    function listEventsForCalendar(calendarHomeId, calendarId, start, end) {
      var body = {
        match: {
          start: start.format(davDateFormat),
          end: end.format(davDateFormat)
        }
      };
      var path = pathBuilder.forCalendarId(calendarHomeId, calendarId);
      return request('post', path, null, body)
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          if (!response.data || !response.data._embedded || !response.data._embedded['dav:item']) {
            return [];
          }
          return response.data._embedded['dav:item'];
        });
    }

    /**
     * List all calendar homes and calendars in the calendar root. A dav:root resource, expanded down to all dav:home resouces.
     * @param  {String} calendarId The calendarId.
     * @return {Object}            An array of dav:home items
     */
    function listAllCalendars() {
      var path = pathBuilder.rootPath();
      return request('get', path + '/.json', {Accept: CALENDAR_ACCEPT_HEADER})
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          if (!response.data || !response.data._embedded || !response.data._embedded['dav:home']) {
            return [];
          }
          return response.data._embedded['dav:home'];
        });
    }

    /**
     * List all calendars in the calendar home. A dav:home resource, containing all dav:calendar resources in it.
     * @param  {String} calendarHomeId The calendarHomeId.
     * @return {Object}                An array of dav:calendar
     */
    function listCalendars(calendarId) {
      var path = pathBuilder.forCalendarHomeId(calendarId);
      return request('get', path, {Accept: CALENDAR_ACCEPT_HEADER})
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          if (!response.data || !response.data._embedded || !response.data._embedded['dav:calendar']) {
            return [];
          }
          return response.data._embedded['dav:calendar'];
        });
    }

    /**
     * Get a calendar (dav:calendar).
     * @param  {String} calendarHomeId The calendarHomeId.
     * @param  {String} calendarId     The calendarId.
     * @return {Object} An array of dav:calendar
     */
    function getCalendar(calendarHomeId, calendarId) {
      var path = pathBuilder.forCalendarId(calendarHomeId, calendarId);
      return request('get', path, {Accept: CALENDAR_ACCEPT_HEADER})
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          return response.data;
        });
    }

    /**
     * Create a calendar in the specified calendar home.
     * @param  {String}         calendarHomeId   The calendar home id in which to create a new calendar
     * @param  {ICAL.Component} calendar      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response.
     */
    function createCalendar(calendarHomeId, calendar) {
      var path = pathBuilder.forCalendarHomeId(calendarHomeId);
      return request('post', path, null, calendar)
        .then(function(response) {
          if (response.status !== 201) {
            return $q.reject(response);
          }
          return response;
        });
    }

    /**
     * Modify a calendar in the specified calendar home.
     * @param  {String}         calendarHomeId   The calendar home id in which to create a new calendar
     * @param  {ICAL.Component} calendar      A dav:calendar object, with an additional member "id" which specifies the id to be used in the calendar url.
     * @return {Object}                        the http response.
     */
    function modifyCalendar(calendarHomeId, calendar) {
      var path = pathBuilder.forCalendarId(calendarHomeId, calendar.id);
      return request('proppatch', path, null, calendar)
        .then(function(response) {
          if (response.status !== 204) {
            return $q.reject(response);
          }
          return response;
        });
    }

    return {
      listEvents: listEvents,
      searchEvents: searchEvents,
      listCalendars: listCalendars,
      getCalendar: getCalendar,
      listEventsForCalendar: listEventsForCalendar,
      listAllCalendars: listAllCalendars,
      createCalendar: createCalendar,
      modifyCalendar: modifyCalendar
    };
  })

  .factory('eventAPI', function($q, request, CALENDAR_ACCEPT_HEADER, CALENDAR_CONTENT_TYPE_HEADER, CALENDAR_GRACE_DELAY, CALENDAR_PREFER_HEADER) {

    /**
     * GET request used to get details of an event of path eventPath.
     * @param  {String} eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @return {Object}           the http response.
     */
    function get(eventPath) {
      return request('get', eventPath, {Accept: CALENDAR_ACCEPT_HEADER})
        .then(function(response) {
          if (response.status !== 200) {
            return $q.reject(response);
          }
          return response;
        });
    }

    /**
     * PUT request used to create a new event in a specific calendar.
     * @param  {String}         eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @param  {ICAL.Component} vcalendar a vcalendar object including the vevent to create.
     * @param  {Object}         options   {graceperiod: true||false} specify if we want to use the graceperiod or not.
     * @return {String||Object}           a taskId if with use the graceperiod, the http response otherwise.
     */
    function create(eventPath, vcalendar, options) {
      var headers = {'Content-Type': CALENDAR_CONTENT_TYPE_HEADER};
      var body = vcalendar.toJSON();
      if (options.graceperiod) {
        return request('put', eventPath, headers, body, {graceperiod: CALENDAR_GRACE_DELAY})
          .then(function(response) {
            if (response.status !== 202) {
              return $q.reject(response);
            }
            return response.data.id;
          });
      }
      return request('put', eventPath, headers, body)
        .then(function(response) {
          if (response.status !== 201) {
            return $q.reject(response);
          }
          return response;
        });
    }

    /**
     * PUT request used to modify an event in a specific calendar.
     * @param  {String}         eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @param  {ICAL.Component} vcalendar a vcalendar object including the vevent to create.
     * @param  {String}         etag      set the If-Match header to this etag before sending the request
     * @return {String}                   the taskId which will be used to create the grace period.
     */
    function modify(eventPath, vcalendar, etag) {
      var headers = {
        'Content-Type': CALENDAR_CONTENT_TYPE_HEADER,
        Prefer: CALENDAR_PREFER_HEADER
      };
      if (etag) {
        headers['If-Match'] = etag;
      }
      var body = vcalendar.toJSON();
      return request('put', eventPath, headers, body, { graceperiod: CALENDAR_GRACE_DELAY })
        .then(function(response) {
          if (response.status !== 202) {
            return $q.reject(response);
          }
          return response.data.id;
        });
    }

    /**
     * DELETE request used to remove an event in a specific calendar.
     * @param  {String} eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @param  {String} etag      set the If-Match header to this etag before sending the request
     * @return {String}           the taskId which will be used to create the grace period.
     */
    function remove(eventPath, etag) {
      var headers = {'If-Match': etag};
      return request('delete', eventPath, headers, null, { graceperiod: CALENDAR_GRACE_DELAY })
        .then(function(response) {
          if (response.status !== 202) {
            return $q.reject(response);
          }
          return response.data.id;
        });
    }

    /**
     * PUT request used to change the participation status of an event
     * @param  {String}         eventPath path of the event. The form is /<calendar_path>/<uuid>.ics
     * @param  {ICAL.Component} vcalendar a vcalendar object including the vevent to create.
     * @param  {String}         etag      set the If-Match header to this etag before sending the request
     * @return {Object}                   the http response.
     */
    function changeParticipation(eventPath, vcalendar, etag) {
      var headers = {
        'Content-Type': CALENDAR_CONTENT_TYPE_HEADER,
        Prefer: CALENDAR_PREFER_HEADER
      };
      if (etag) {
        headers['If-Match'] = etag;
      }
      var body = vcalendar.toJSON();
      return request('put', eventPath, headers, body)
        .then(function(response) {
          if (response.status !== 200 && response.status !== 204) {
            return $q.reject(response);
          }
          return response;
        });
    }

    return {
      get: get,
      create: create,
      modify: modify,
      remove: remove,
      changeParticipation: changeParticipation
    };
  });
