"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Author: Tai Dong <dongtaiit@gmail.com>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Date:   2019-09-09 22:47:14
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Last Modified by:   Tai Dong
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     * @Last Modified time: 2019-09-19 11:33:46
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     */

var _axios = require("axios");

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var self = void 0;

var Post = function () {
  function Post(config) {
    _classCallCheck(this, Post);

    this.routeRegex = {
      PostsIndex: /(@[\w\.\d-]+)\/feed\/?$/,
      UserProfile1: /(@[\w\.\d-]+)\/?$/,
      UserProfile2: /(@[\w\.\d-]+)\/(blog|posts|comments|transfers|curation-rewards|author-rewards|permissions|created|recent-replies|feed|password|followed|followers|settings)\/?$/,
      UserProfile3: /(@[\w\.\d-]+)\/[\w\.\d-]+/,
      CategoryFilters: /(hot|trending|promoted|payout|payout_comments|created)\/?$/gi,
      PostNoCategory: /(@[\w\.\d-]+)\/([\w\d-]+)/,
      Post: /([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)\/?($|\?)/,
      PostJson: /([\w\d\-\/]+)\/(\@[\w\d\.-]+)\/([\w\d-]+)(\.json)$/,
      UserJson: /(@[\w\.\d-]+)(\.json)$/,
      UserNameJson: /^.*(?=(\.json))/
    };
    this.config = config;
    self = this;
  }

  _createClass(Post, [{
    key: "_formatPostContent",
    value: function _formatPostContent(post) {
      if (!post) return post;

      var tags = post.tags || [];
      var body = post.content || post.shortDesc;

      return {
        "post_id": post.postId,
        "author": post.user.username,
        "permlink": post.postId,
        "category": tags[0] || 'unknown',
        "title": post.title,
        "body": body,
        "json_metadata": JSON.stringify({
          "image": [post.thumbnail]
        }),
        "created": new Date(post.createdAt),
        "last_update": new Date(post.updatedAt),
        "depth": 0,
        "children": post.count_comment,
        "share_count": post.count_share || 0,
        "net_rshares": 425554588016215,
        "last_payout": new Date(post.createdAt),
        "cashout_time": new Date(),
        "total_payout_value": "0.000 USD",
        "curator_payout_value": "0.000 USD",
        "pending_payout_value": post.totalReward + " USD",
        "promoted": "0.000 USD",
        "replies": [],
        "body_length": body.length,
        "active_votes": [],
        "author_reputation": 21765957547111,
        "parent_author": "",
        "parent_permlink": post.user.username,
        "url": "/" + tags[0] + "/" + post.user.username + "/" + post.postId,
        "root_title": post.title,
        "beneficiaries": [],
        "max_accepted_payout": "1000000.000 USD",
        "percent_steem_dollars": 10000
      };
    }
  }, {
    key: "_buildData",
    value: function _buildData(path, posts, type) {
      posts = posts || [];
      var orignalPath = path.split('/')[0];
      var now = new Date();
      var result = {
        "feed_price": {
          "base": "0.210 USD",
          "quote": "1.000 MCASH"
        },
        "props": {
          "time": now,
          "sbd_print_rate": 0,
          "sbd_interest_rate": 0,
          "head_block_number": 36253942,
          "total_vesting_shares": "396853140515.514648 VESTS",
          "total_vesting_fund_steem": "200344821.392 STEEM",
          "last_irreversible_block_num": 36253924
        },
        "tags": {},
        "accounts": {},
        "content": {},
        "tag_idx": {
          "trending": []

        },
        "discussion_idx": {
          "": {}
        }
      };
      var discussionIdx = void 0;
      if (type) {
        result.discussion_idx[""][type] = result.discussion_idx[""][type] || [];
        discussionIdx = result.discussion_idx[""][type];
      }

      var tagsTemp = {};

      posts.map(function (post) {
        post.tags.map(function (tag) {
          if (!tagsTemp[tag]) {
            tagsTemp[tag] = 1;
            result.tag_idx.trending.push(tag);
          }
        });
        if (discussionIdx) discussionIdx.push(post.user.username + "/" + post.postId);

        result.content[post.user.username + "/" + post.postId] = self._formatPostContent(post);
      });

      return result;
    }

    /*
     {
       tag,
       limit,
       start_author,
       start_permlink
     }     
     */

  }, {
    key: "getDiscussionsByTrendingAsync",
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(query) {
        var url, posts;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                console.log('query getDiscussionsByTrendingAsync', query, typeof query === "undefined" ? "undefined" : _typeof(query));
                url = self.config.campp_api + "/posts?type=hot&pageSize=" + (query.pageSize || 10) + "&lastPostId=" + (query.start_permlink || 0);

                if (query.tag) url += "&tag=" + query.tag;
                _context.next = 5;
                return _axios2.default.get(url).then(function (res) {
                  return res.data.data;
                }).catch(function (ex) {
                  console.log('ex', ex);
                  return null;
                });

              case 5:
                posts = _context.sent;
                return _context.abrupt("return", posts.map(function (item) {
                  return self._formatPostContent(item);
                }));

              case 7:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function getDiscussionsByTrendingAsync(_x) {
        return _ref.apply(this, arguments);
      }

      return getDiscussionsByTrendingAsync;
    }()
  }, {
    key: "_buildPostAPI",
    value: function _buildPostAPI(path) {
      path = decodeURIComponent(path);
      var url = self.config.campp_api + "/posts";
      var match = path.match(self.routeRegex.PostsIndex); //user's feed
      if (match) {
        url += "?type=feed";
        return { url: url, type: 'feed' };
      }

      match = path.match(self.routeRegex.UserProfile1); //user's posts
      if (match) {
        url += "?type=new&username=" + match[1];
        return { url: url };
      }

      match = path.match(self.routeRegex.Post); //post detail: /trending/@tino/perm-link
      if (match) {
        url += "?type=new&id=" + match[3];
        return { url: url };
      }

      match = path.match(self.routeRegex.PostNoCategory); //@tino/some-tag
      if (match) {
        var postId = match[2];
        url += "?type=new&username=" + match[1].replace('@', '') + "&tag=" + match[2];
        return { url: url };
      }

      match = path.match(/(hot|trending|promoted|payout|payout_comments|created)\/?$/) || path.match(/(hot|trending|promoted|payout|payout_comments|created)\/([\w\s\d-]+)\/?$/);
      if (match) {
        url += "?type=" + (match[1] == 'created' ? 'new' : 'hot');
        if (match[2]) url += "&tag=" + match[2];
        return { url: url, type: match[1] };
      }

      return {
        url: url,
        type: type
      };
    }
  }, {
    key: "getStateAsync",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'trending';
        var accessToken = arguments[1];

        var _self$_buildPostAPI, url, type, options, posts;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                console.log('getStateAsync', path);

                _self$_buildPostAPI = self._buildPostAPI(path), url = _self$_buildPostAPI.url, type = _self$_buildPostAPI.type;
                options = {
                  validateStatus: function validateStatus(status) {
                    return status >= 200 && status < 500;
                  }
                };


                if (accessToken) {
                  options.headers = {
                    Authorization: "Bearer " + accessToken
                  };
                }
                console.log('url', url);
                _context2.next = 7;
                return _axios2.default.get(url, options).then(function (res) {
                  if (res.data.error) {
                    console.error('fetch API error', JSON.stringify(res.data.error, null, 2));
                    return null;
                  }

                  return res.data.data;
                }).catch(function (ex) {
                  console.log('ex', ex);
                  return null;
                });

              case 7:
                posts = _context2.sent;
                return _context2.abrupt("return", self._buildData(path, posts, type));

              case 9:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function getStateAsync() {
        return _ref2.apply(this, arguments);
      }

      return getStateAsync;
    }()
  }, {
    key: "getTopAuthorAsync",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var url;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                url = self.config.campp_api + "/users/top-authors";
                return _context3.abrupt("return", _axios2.default.get(url, {
                  validateStatus: function validateStatus(status) {
                    return status >= 200 && status < 500;
                  }
                }).then(function (res) {
                  if (res.data.error) {
                    console.error('fetch API error', JSON.stringify(res.data.error, null, 2));
                    return null;
                  }

                  return res.data.data;
                }).catch(function (ex) {
                  console.log('ex', ex);
                  return [];
                }));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getTopAuthorAsync() {
        return _ref3.apply(this, arguments);
      }

      return getTopAuthorAsync;
    }()
  }]);

  return Post;
}();

exports = module.exports = Post;