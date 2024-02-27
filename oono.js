(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.oonoStories = factory());
})(this, (function () { 'use strict';

  const 
  defaultConfig = { 
    containerId: "oono-container", 
    tenantId: "oono",
    autoRefresh: true,
    preview: false
 },
 widgetWidth = "66px",
 widgetHeight = "66px",
 logoMaxWidth = "200px",
 refreshTimer = 10000,
 autoRefresh = true,
 preview = false
 ;


  var select$1 = function select(element) {
    return typeof element === "string" ? document.querySelector(element) : element();
  };
  var create = function create(tag, options) {
    var el = typeof tag === "string" ? document.createElement(tag) : tag;
    for (var key in options) {
      var val = options[key];
      el.setAttribute(key, val);
    }
    return el;
  };
 
  var debounce = function debounce(callback, duration) {
    var timer;
    
    return function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        return callback();
      }, duration);
    };
  };

  var createMainWidget = (ctx) => {
    ctx.widgetDiv = create("div", {});
    ctx.widgetDiv.className = "oono-widget";
    ctx.widgetDiv.style.cssText = ctx.options.widgetContainerStyle; // Set the styles provided
    ctx.widgetDiv.style.position = "relative";
    ctx.widgetDiv.style.cursor = "pointer";
    ctx.widgetDiv.style.width = "100%";
    ctx.widgetDiv.style.height = "100%";
    ctx.widgetDiv.style.boxSizing = "border-box";

    ctx.widgetDiv.style.borderColor = "transparent";
    ctx.widgetDiv.style.borderWidth = "2px";
    ctx.widgetDiv.style.borderStyle = "solid";

    


    if (!ctx.options.activeStoriesCount) {
        if (ctx.options.showCircle) {
            ctx.widgetDiv.style.border = "2px solid transparent";
            ctx.widgetDiv.style.padding = "1.5px";
            ctx.widgetDiv.style.borderRadius = "50%";
            ctx.widgetDiv.style.overflow = "hidden";
            ctx.widgetDiv.style.height = widgetWidth;
            ctx.widgetDiv.style.width = widgetHeight;
        } else {
            ctx.widgetDiv.style.height = "auto";
            ctx.widgetDiv.style.width = "auto";
        }
    } else {
        //widgetDiv.style.border = "3px solid red";
        ctx.widgetDiv.style.padding = "1.5px";
        ctx.widgetDiv.style.borderRadius = "50%";
        ctx.widgetDiv.style.display = "flex";
        ctx.widgetDiv.style.alignItems = "center";
        ctx.widgetDiv.style.justifyContent = "center";
        ctx.widgetDiv.style.height = widgetWidth;
        ctx.widgetDiv.style.width = widgetHeight;
    }
  };

  var createBadgeDiv = (ctx) => {
    // Create a div for the story badge
    ctx.badgeDiv = create("div", {});
    ctx.badgeDiv.className = "oono-badge";
    ctx.badgeDiv.style.cssText ="display:none; box-sizing: border-box; width: 18px; height: 18px; align-items: center; justify-content: center; position: absolute; background: red; top: -5px; right: -5px; padding: 0px; border-radius: 50%; color: white; font-size: 11px; line-height: 11px; font-weight: bold;";
    ctx.widgetDiv.appendChild(ctx.badgeDiv);
  };

  var createIframeBtnDiv = (ctx) => {
    ctx.iframeBtnDiv = create("div", {});
    ctx.iframeBtnDiv.className = "oono-iframe-btn";
    //ctx.iframeBtnDiv.style.cssText = ctx.options.openButtonStyle; // Set the styles provided
    ctx.iframeBtnDiv.style.cssText = "box-sizing:border-box;width:100%;height:auto;box-sizing:border-box";
    if (ctx.options.activeStoriesCount) {
        ctx.iframeBtnDiv.style.cssText = "width:calc(100% - 4px); height: calc(100% - 4px); border: solid 1px lightgrey; border-radius: 50%";
    }
  };

  var createOpenStoryBtn = (ctx) => {
    // Create the story button itself
    ctx.openStoryButton = create("div", {});
    ctx.openStoryButton.className = "oono-open-story-button";
    // Set styles for the button based on the presence of 'showCircle' in ctx.options
    if (ctx.options.activeStoriesCount) {
        ctx.openStoryButton.style.cssText =
            "box-sizing:border-box;width:100%;height:100%;border-radius:50%; display:flex;align-items:center;justify-content:center;overflow:hidden";
    } else {
        ctx.openStoryButton.style.cssText = "width:100%;height:auto;";
    }
    // Add click event to show the iframe stories
    ctx.openStoryButton.onclick = function () {
      //console.log("openStory btn clicked", ctx.container)
        openWindow(ctx);
    };
    // Check if ctx.logoURL is provided in ctx.options
    if (ctx.options.logoURL) {
        // If yes, create an image element and set its attributes
        ctx.logo = create("img", {});
        ctx.logo.src = ctx.options.logoURL;
        ctx.logo.style.width = "100%";
        ctx.logo.style.height = "auto";
        ctx.logo.style.objectFit = "cover";
        if(ctx.options.showCircle){
          ctx.logo.style.height = "100%";
        }
        ctx.logo.style.maxWidth = logoMaxWidth;
        ctx.logo.style.scale = "1.05";
        ctx.openStoryButton.appendChild(ctx.logo); // Append the image to the story button
    } else if (ctx.options.buttonText) {
        // If ctx.logoURL is not provided but buttonText is, set the text content of the button
        ctx.openStoryButton.textContent = ctx.options.buttonText;
    } else {
        // If neither ctx.logoURL nor buttonText is provided, create an SVG element as the button content
        ctx.openStoryButton.innerHTML =
            `<svg xmlns="http://www.w3.org/2000/svg" style="width:${widgetWidth};height:${widgetWidth}" fill="
            ${ctx.options?.svgIconColor}
            " viewbox="0 0 24 24" id="instagram-story"><path fill="
            ${ctx.options?.svgIconColor} 
            " fill-rule="evenodd" clip-rule="evenodd" d="M10.2263 2.128C10.3296 2.52914 10.0881 2.93802 9.68694 3.04127 9.19056 3.16903 8.7103 3.33698 8.24979 3.54149 7.87123 3.7096 7.42806 3.539 7.25994 3.16044 7.09183 2.78187 7.26243 2.3387 7.64099 2.17059 8.17667 1.9327 8.73547 1.73727 9.31306 1.58861 9.7142 1.48537 10.1231 1.72686 10.2263 2.128zM5.75633 4.15238C6.03781 4.45625 6.01966 4.93078 5.71579 5.21226 4.97148 5.90172 4.34093 6.71184 3.85525 7.61113 3.65841 7.97559 3.2034 8.11148 2.83894 7.91464 2.47448 7.71781 2.33859 7.26279 2.53543 6.89834 3.1 5.85298 3.83243 4.91218 4.69645 4.11183 5.00032 3.83035 5.47485 3.8485 5.75633 4.15238zM2.25612 9.61903C2.66481 9.6865 2.94142 10.0725 2.87396 10.4812 2.79247 10.9748 2.75 11.4821 2.75 11.9999 2.75 12.5177 2.79247 13.025 2.87396 13.5186 2.94142 13.9273 2.66481 14.3133 2.25612 14.3808 1.84744 14.4482 1.46145 14.1716 1.39399 13.7629 1.29922 13.1888 1.25 12.5998 1.25 11.9999 1.25 11.4 1.29922 10.811 1.39399 10.2369 1.46145 9.82819 1.84744 9.55157 2.25612 9.61903zM2.83894 16.0851C3.2034 15.8883 3.65841 16.0242 3.85525 16.3887 4.34093 17.288 4.97147 18.0981 5.71578 18.7875 6.01966 19.069 6.03781 19.5435 5.75633 19.8474 5.47485 20.1513 5.00032 20.1694 4.69644 19.888 3.83243 19.0876 3.1 18.1468 2.53543 17.1015 2.33859 16.737 2.47448 16.282 2.83894 16.0851zM7.25994 20.8394C7.42805 20.4608 7.87122 20.2902 8.24979 20.4583 8.7103 20.6628 9.19056 20.8308 9.68694 20.9585 10.0881 21.0618 10.3296 21.4707 10.2263 21.8718 10.1231 22.2729 9.7142 22.5144 9.31306 22.4112 8.73547 22.2625 8.17667 22.0671 7.64099 21.8292 7.26243 21.6611 7.09183 21.2179 7.25994 20.8394zM11.25 2C11.25 1.58579 11.5858 1.25 12 1.25 17.9371 1.25 22.75 6.06294 22.75 12 22.75 12.4142 22.4142 12.75 22 12.75 21.5858 12.75 21.25 12.4142 21.25 12 21.25 6.89137 17.1086 2.75 12 2.75 11.5858 2.75 11.25 2.41421 11.25 2zM21.4682 15.3127C21.8478 15.4786 22.021 15.9207 21.8552 16.3003 20.197 20.0954 16.4094 22.75 12 22.75 11.5858 22.75 11.25 22.4142 11.25 22 11.25 21.5858 11.5858 21.25 12 21.25 15.7919 21.25 19.0526 18.9682 20.4806 15.6997 20.6465 15.3202 21.0886 15.1469 21.4682 15.3127z"></path></svg>`;
    }

    // Append the story button to the ctx.iframeBtnDiv
    ctx.iframeBtnDiv.appendChild(ctx.openStoryButton);
    ctx.widgetDiv.appendChild(ctx.iframeBtnDiv);
  };

  var createIframeStoriesDiv = (ctx) => {
    // Create a div for the iframe stories
    ctx.iframeStoriesDiv = create("div", {});
    ctx.iframeStoriesDiv.className = "oono-iframe-stories";
    ctx.iframeStoriesDiv.style.display = "none";
    ctx.iframeStoriesDiv.style.position = "relative";
    ctx.iframeStoriesDiv.style.boxSizing = "border-box";
  };

  var createIframe = (ctx) => {
    // Create an iframe for the stories and set its attributes
    ctx.iframe = create("iframe", {});
    // open iframe
    if(ctx.sessionId){
      setIframeUrl(ctx);
    }

    ctx.iframe.allow = "autoplay";
    ctx.iframe.className = "oono-iframe";
    ctx.iframe.style.cssText = "position: fixed; top: initial; background-color: rgb(0, 0, 0); left: 0px; width: 100vw; height: 100%; z-index: 1100; border: none; outline: 0px; padding: 0px; margin: 0px; bottom: constant(safe-area-inset-bottom); bottom: env(safe-area-inset-bottom);";
    ctx.iframeStoriesDiv.appendChild(ctx.iframe);
    ctx.widgetDiv.appendChild(ctx.iframeStoriesDiv);
  };

  

  var eventEmitter = (function (name, ctx) {
    ctx.input.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: ctx.feedback,
      cancelable: true
    }));
  });

  const showHideRing = (ctx, data) => {
    if (!ctx.container) {
        return;
    }
    if (!ctx.options?.activeStoriesCount) {
        return;
    }
    
    if (
        (typeof data === "undefined" || data.unseenCount) &&
        ctx.options.activeStoriesCount
    ) {
        // showing ring
        ctx.widgetDiv.style.borderColor = "red";
        ctx.widgetDiv.style.borderWidth = "3.5px";
        ctx.widgetDiv.style.borderStyle = "solid";

        // show badge
        ctx.badgeDiv.style.display = "flex";
        ctx.badgeDiv.innerHTML = data?.unseenCount;

    } else {
        // hiding ring
        ctx.widgetDiv.style.borderColor = "lightgrey";
        ctx.widgetDiv.style.borderWidth = "2px";
        ctx.widgetDiv.style.borderStyle = "solid";

        //hide badge
        ctx.badgeDiv.style.display = "none";
    }
};

const checkUnseenStories = (ctx) => {
  
    if (ctx.requestBusy) {
        return;
    }
    ctx.requestBusy = true;
    if (!ctx.options.tenantId) {
        showHideRing(ctx, null);
        return;
    }
    console.log("checking unseen stories");
    var requestUrl = `https://${ctx.options.tenantId}.oono.ai/api/tenant/stories/have-unseen`;
    var postData = {};
    if (ctx.sessionId) {
        postData = {
            sessionId: ctx.sessionId,
        };
    }

    // Options for the fetch request
    var requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
    };

    // Send the POST request
    fetch(requestUrl, requestOptions)
        .then((response) => response.json())
        .then((data) => {
            // Handle the response data here
            //console.warn(data);
            if (data && data.status && data.data) {
              if(!ctx.sessionId){
                ctx.sessionId = data.data.sessionId;
                setIframeUrl(ctx);
              }
              
              localStorage.setItem("oono-sessionId", data.data.sessionId);
              showHideRing(ctx, data.data);
            }
            ctx.requestBusy = false;
        })
        .catch((error) => {
            console.error("Error checking stories:", error);
            showHideRing(ctx, null);
            ctx.requestBusy = false;
        }).finally(() => {
            

        });
};

const setIframeUrl = (ctx, story) => {
  if(typeof story === "undefined"){
    var story = 0;
  }
  const prev = ctx.preview ? 1 : 0;
  ctx.iframe.src = `${ctx.options.iframeURL}?session=${ctx.sessionId}&url=${ctx.url}&preview=${prev}&closeBtn=1&resume=0&storyId=${story}`;
};

const handleIframeLoaded = (ctx) => {
    if (!ctx.container) {
        return;
    }
    // iframe load listener
    ctx.iframe.addEventListener("load", function () {
        if (!this.src || this.src == window.location.href) {
            return;
        }
        // The iframe has finished loading
        if (ctx.iframeStoriesDiv) {
            ctx.iframeLoaded = true;
            if (ctx.openWindow) {
                setTimeout(() => {
                  ctx.container.style.opacity = "1";
                  ctx.iframeStoriesDiv.style.display = "inline-block";
                  ctx.iframe.contentWindow.postMessage('resume', 'https://stories.oono.ai');
                }, 200);
                //ctx.openWindow = false;
            }

        }
    });
};

const appendHtml = (ctx) => {
  ctx.container.innerHTML = "";
  ctx.container.appendChild(ctx.widgetDiv);
}

const addEventListeners = (ctx) => {

  window.addEventListener('message', function (event) {
      // Check if the message is from the iframe
      if (event.source === ctx.iframe.contentWindow) {
          // Log the message sent from the iframe
          //console.log('Message received from iframeee:', event.data);
          if (event.data == 'Escape') {
            console.log("exit window");
              closeWindow(ctx);
          }
  
      }
  });

  // close window on escape
  document.onkeydown = (evt) => {
      //console.log("key down", evt)
      if (evt.code == 'Escape') {
          //console.log("close escape")
          closeWindow(ctx);
      }
  };

};

const fetchConfig = async (ctx) => {


  
  
  var requestUrl = `https://${ctx.options.tenantId}.oono.ai/api/tenant/get-snippet/${ctx.uuid}?sessionId=${ctx.sessionId}`;
  
  let res = null;
  // Send the GET request
  await fetch(requestUrl)
      .then((response) => response.json())
      .then((data) => {
          if (data && data.status && data.data) {
            res = data.data;
          }
      })
      .catch((error) => {
        console.log("error fetching config", error)
      }).finally(() => {
      });
      return res;
};

const doRefresh = async (ctx)  => {
  if(!ctx.container.dataset.initialized){
    return false;
  }
  console.log("refreshing");
  const data = await fetchConfig(ctx);
  if(!data){
    return false;
  }
  if(data.logoURL != ctx.options.logoURL){
    ctx.options = data;
    return init(ctx, false);
  }
  ctx.options.firstToWatch = data.firstToWatch;
  if(data.firstToWatch){
    setStoryId(ctx, data.firstToWatch);
  }
  if(data.activeStoriesCount != ctx.options.activeStoriesCount || 
    data.unseenCount != ctx.options.unseenCount){
      ctx.options.activeStoriesCount = data.activeStoriesCount;
      ctx.options.unseenCount = data.unseenCount;
      showHideRing(ctx, data);
  }
}

const refresh = async (ctx)  => {
  if(!ctx.container.dataset.initialized){
    return false;
  }
  await doRefresh(ctx);
  var refTimer = debounce(() =>{
    refresh(ctx)
  },ctx.refreshTimer)
  if(ctx.autoRefresh){
    refTimer();
  }
}

const destroy = (ctx) => {
  ctx.container.dataset.initialized = false;
  return ctx.container.innerHTML = "";
}
  
  const init =  (ctx, allowRefresh = true) => {
    var _this = this;
    return new Promise(function ($return, $error) {
      createMainWidget(ctx);
      createBadgeDiv(ctx);
      createIframeBtnDiv(ctx);
      createOpenStoryBtn(ctx);
      createIframeStoriesDiv(ctx);
      createIframe(ctx);
      appendHtml(ctx);
      addEventListeners(ctx);
      handleIframeLoaded(ctx);
      setTimeout(() => {
          if (ctx.options.activeStoriesCount) {
              checkUnseenStories(ctx);
          }
      }, 200);
      if(allowRefresh){
        var autoRefresh = debounce(() =>{
          refresh(ctx)
        },ctx.refreshTimer)
        if(ctx.autoRefresh){
          autoRefresh();
        }
      }
      
      
    });
  }

  const setStoryId = (ctx, id) => {
    if(ctx.openWindow){
      return console.warn("window opened!");
    }
    if(!ctx.iframe){
      return console.error("iframe not exists");
    }
    setIframeUrl(ctx, id);
  }

  function extend (oonoStories) {
    var prototype = oonoStories.prototype;
    prototype.init = function () {
      init(this);
    };
    prototype.destroy = function () {
      destroy(this);
    };
    prototype.refresh = function () {
      doRefresh(this);
    };
    prototype.setStoryId = function (storyId) {
      setStoryId(this, storyId)
    };
    prototype.open = function () {
      if(!this.openStoryButton){
        return console.error('No open button found');
      }
      this.openStoryButton.click();
    };
    prototype.close = function () {
      closeWindow(this);
    };
  }

  const closeWindow = (ctx) => {
    ctx.openWindow = false;
    ctx.iframeStoriesDiv.style.display = "none";
    checkUnseenStories(ctx);
    setIframeUrl(ctx);
  }

  const openWindow = (ctx) => {
    if (ctx.iframeStoriesDiv) {
      ctx.container.style.opacity = "0.5";
        ctx.openWindow = true;
        if (ctx.iframeLoaded && ctx.sessionId) {
            setTimeout(() => {
              ctx.container.style.opacity = "1";
              ctx.iframeStoriesDiv.style.display = "inline-block";
              //console.log("trigger resume event");
              ctx.iframe.contentWindow.postMessage('resume', 'https://stories.oono.ai');
            }, 200);
        }
    }
  }

  const makeSessionId = (length) => {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  };

  const getSessionId = () => {
    let session = localStorage.getItem("oono-sessionId");
    if(!session){
      session = makeSessionId(15);
    }
    return session;
  };

  const doInit = async (ctx) => {

    if(!ctx.options.tenantId){
      console.error(`invalid tenant id `);
      return false;
    }
    if(!ctx.options.containerId){
      console.error(`invalid container id `);
      return false;
    }
    if(!ctx.options.widgetId){
      console.error(`invalid widget id `);
      return false;
    }
    ctx.selector = ctx.options.selector || "#" + ctx.options.containerId;
    ctx.uuid = ctx.options.widgetId;
    ctx.element = select$1(ctx.selector);
    ctx.container = ctx.element;
    if(!ctx.container){
      console.error(`invalid container id: ${ctx.selector} `);
      return false;
    }
    if(ctx.container.dataset.initialized){
      console.warn(`the element has been initialized`);
      return;
    }
    ctx.container.dataset.initialized = "true";
    ctx.autoRefresh = typeof ctx.options.autoRefresh !== "undefined" ? ctx.options.autoRefresh : autoRefresh;
    ctx.preview = typeof ctx.options.preview !== "undefined" ? ctx.options.preview : preview;
    ctx.sessionId = getSessionId();
    ctx.url = window.location.href;
    ctx.timestamp = new Date().getTime();
    ctx.refreshTimer = ctx.options.refreshTimer ? ctx.options.refreshTimer : refreshTimer;
    extend.call(ctx, oonoStories);
    const data = await fetchConfig(ctx);
    if(!data){
      console.error(`invalid  config`);
      return false;
    }
    ctx.options = data;
    init(ctx);
  }

  function oonoStories(config) {
    if(typeof this === "undefined"){
      return false;
    }
    this.options = typeof config === "undefined" ? defaultConfig : config;
    this.id = oonoStories.instances = (oonoStories.instances || 0) + 1;
    this.name = `oonoStories-${this.id}`;
    this.debounce = 0;
    doInit(this);
  }

  return oonoStories;

}));