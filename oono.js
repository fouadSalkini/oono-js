/*!
 * oono JavaScript Library v1.0.32
 *
 * Copyright wecansync
 *
 * Date: 2024-02-29T17:08Z
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.oonoStories = factory());
})(this, (function () { 'use strict';

  const 
  widgetWidth = "66",
  widgetHeight = "66",
  logoMaxWidth = "200px",
  refreshTimer = 10000,
  autoRefresh = true,
  preview = false,
  defaultTenant = "oono",
  defaultContainerId = "oono-container",
  defaultHost = "oono.ai",

  defaultConfig = { 
    containerId: defaultContainerId, 
    tenantId: defaultTenant,
    autoRefresh: true,
    preview: false,
    host: defaultHost,
    width: widgetWidth,
    height: widgetHeight,
 }
 
 ;


  const select$1 = (element) => {
    const sel = typeof element === "string" ? document.querySelectorAll(element) : element();
    // for(var i=0; i < sel.length; i++){
    //   if(!sel[i].dataset.initialized){
    //     return sel[i];
    //   }
    // }
    return sel;
  };

  const create = (tag, options) => {
    var el = typeof tag === "string" ? document.createElement(tag) : tag;
    for (var key in options) {
      var val = options[key];
      el.setAttribute(key, val);
    }
    return el;
  };
 
  const debounce = (callback, duration) => {
    var timer;
    
    return function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        return callback();
      }, duration);
    };
  };

  const createMainWidget = (ctx) => {
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

    ctx.widgetDiv.style.padding = "2px";


    if (!ctx.options.activeStoriesCount) {
        if (ctx.options.showCircle) {
            ctx.widgetDiv.style.border = "2px solid transparent";
            ctx.widgetDiv.style.borderRadius = "50%";
            ctx.widgetDiv.style.overflow = "hidden";
            ctx.widgetDiv.style.height = `${ctx.width}px`;
            ctx.widgetDiv.style.width = `${ctx.height}px`;
        } else {
            ctx.widgetDiv.style.height = "auto";
            ctx.widgetDiv.style.width = "auto";
        }
    } else {
        //widgetDiv.style.border = "3px solid red";
        ctx.widgetDiv.style.borderRadius = "50%";
        ctx.widgetDiv.style.display = "flex";
        ctx.widgetDiv.style.alignItems = "center";
        ctx.widgetDiv.style.justifyContent = "center";
        ctx.widgetDiv.style.height = `${ctx.width}px`;
        ctx.widgetDiv.style.width = `${ctx.height}px`;
    }
  };

  const createBadgeDiv = (ctx) => {
    // Create a div for the story badge
    ctx.badgeDiv = create("div", {});
    ctx.badgeDiv.className = "oono-badge";
    ctx.badgeDiv.style.cssText =`display:none; box-sizing: border-box; width: 33%; height: 33%; align-items: center; justify-content: center; position: absolute; background: red; top: -${ctx.width/13}px; right: -${ctx.width/13}px; padding: 0px; border-radius: 50%; color: white; font-size: ${ctx.width/5}px; line-height: ${ctx.width/5}px; font-weight: bold;font-family:system-ui`;
    ctx.widgetDiv.appendChild(ctx.badgeDiv);
  };

  const createIframeBtnDiv = (ctx) => {
    ctx.iframeBtnDiv = create("div", {});
    ctx.iframeBtnDiv.className = "oono-iframe-btn";
    //ctx.iframeBtnDiv.style.cssText = ctx.options.openButtonStyle; // Set the styles provided
    ctx.iframeBtnDiv.style.cssText = "width:100%;height:auto;box-sizing:border-box";
    if (ctx.options.activeStoriesCount) {
        ctx.iframeBtnDiv.style.cssText = "box-sizing:border-box;width:100%; height: 100%; border: solid 1px lightgrey; border-radius: 50%";
    }
  };

  const createOpenStoryBtn = (ctx) => {
    // Create the story button itself
    ctx.openStoryButton = create("div", {});
    ctx.openStoryButton.className = "oono-open-story-button";
    // Set styles for the button based on the presence of 'showCircle' in ctx.options
    if (ctx.options.activeStoriesCount) {
        ctx.openStoryButton.style.cssText =
            "box-sizing:border-box;width:100%;height:100%;border-radius:50%; display:flex;align-items:center;justify-content:center;overflow:hidden";
    } else {
        ctx.openStoryButton.style.cssText = "box-sizing:border-box;width:100%;height:auto;";
    }
    // Add click event to show the iframe stories
    ctx.openStoryButton.onclick = function (e) {
      //console.log("openStory btn clicked", ctx.container)
        openWindow(ctx, this);
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
            `<svg xmlns="http://www.w3.org/2000/svg" style="width:${ctx.width}px;height:${ctx.height}px" fill="
            ${ctx.options?.svgIconColor}
            " viewbox="0 0 24 24" id="instagram-story"><path fill="
            ${ctx.options?.svgIconColor} 
            " fill-rule="evenodd" clip-rule="evenodd" d="M10.2263 2.128C10.3296 2.52914 10.0881 2.93802 9.68694 3.04127 9.19056 3.16903 8.7103 3.33698 8.24979 3.54149 7.87123 3.7096 7.42806 3.539 7.25994 3.16044 7.09183 2.78187 7.26243 2.3387 7.64099 2.17059 8.17667 1.9327 8.73547 1.73727 9.31306 1.58861 9.7142 1.48537 10.1231 1.72686 10.2263 2.128zM5.75633 4.15238C6.03781 4.45625 6.01966 4.93078 5.71579 5.21226 4.97148 5.90172 4.34093 6.71184 3.85525 7.61113 3.65841 7.97559 3.2034 8.11148 2.83894 7.91464 2.47448 7.71781 2.33859 7.26279 2.53543 6.89834 3.1 5.85298 3.83243 4.91218 4.69645 4.11183 5.00032 3.83035 5.47485 3.8485 5.75633 4.15238zM2.25612 9.61903C2.66481 9.6865 2.94142 10.0725 2.87396 10.4812 2.79247 10.9748 2.75 11.4821 2.75 11.9999 2.75 12.5177 2.79247 13.025 2.87396 13.5186 2.94142 13.9273 2.66481 14.3133 2.25612 14.3808 1.84744 14.4482 1.46145 14.1716 1.39399 13.7629 1.29922 13.1888 1.25 12.5998 1.25 11.9999 1.25 11.4 1.29922 10.811 1.39399 10.2369 1.46145 9.82819 1.84744 9.55157 2.25612 9.61903zM2.83894 16.0851C3.2034 15.8883 3.65841 16.0242 3.85525 16.3887 4.34093 17.288 4.97147 18.0981 5.71578 18.7875 6.01966 19.069 6.03781 19.5435 5.75633 19.8474 5.47485 20.1513 5.00032 20.1694 4.69644 19.888 3.83243 19.0876 3.1 18.1468 2.53543 17.1015 2.33859 16.737 2.47448 16.282 2.83894 16.0851zM7.25994 20.8394C7.42805 20.4608 7.87122 20.2902 8.24979 20.4583 8.7103 20.6628 9.19056 20.8308 9.68694 20.9585 10.0881 21.0618 10.3296 21.4707 10.2263 21.8718 10.1231 22.2729 9.7142 22.5144 9.31306 22.4112 8.73547 22.2625 8.17667 22.0671 7.64099 21.8292 7.26243 21.6611 7.09183 21.2179 7.25994 20.8394zM11.25 2C11.25 1.58579 11.5858 1.25 12 1.25 17.9371 1.25 22.75 6.06294 22.75 12 22.75 12.4142 22.4142 12.75 22 12.75 21.5858 12.75 21.25 12.4142 21.25 12 21.25 6.89137 17.1086 2.75 12 2.75 11.5858 2.75 11.25 2.41421 11.25 2zM21.4682 15.3127C21.8478 15.4786 22.021 15.9207 21.8552 16.3003 20.197 20.0954 16.4094 22.75 12 22.75 11.5858 22.75 11.25 22.4142 11.25 22 11.25 21.5858 11.5858 21.25 12 21.25 15.7919 21.25 19.0526 18.9682 20.4806 15.6997 20.6465 15.3202 21.0886 15.1469 21.4682 15.3127z"></path></svg>`;
    }

    // Append the story button to the ctx.iframeBtnDiv
    ctx.iframeBtnDiv.appendChild(ctx.openStoryButton);
    ctx.widgetDiv.appendChild(ctx.iframeBtnDiv);
  };

  const createIframeStoriesDiv = (ctx) => {
    // Create a div for the iframe stories
    const iframeClass = `.oono-iframe-stories-${ctx.uuid}`;
    const alreadyAdded = select$1(iframeClass);
    if(alreadyAdded.length){
      ctx.iframeStoriesDiv = alreadyAdded[0];
      ctx.iframeLoaded = true;
      return;
    }
    ctx.iframeStoriesDiv = create("div", {});
    ctx.iframeStoriesDiv.style.cssText = `overflow:hidden;box-sizing:border-box;position: fixed; top: 0px; left: 0px; width: 100vw; height: 100%; z-index: 999999999; border: none; outline: 0px; padding: 0px; margin: 0px; margin-left:auto; margin-right:auto; bottom: constant(safe-area-inset-bottom); bottom: env(safe-area-inset-bottom);`;
    ctx.iframeStoriesDiv.style.display = "none";
    ctx.iframeStoriesDiv.className = `oono-iframe-stories oono-iframe-stories-${ctx.uuid}`;

    
  };

  const createIframe = (ctx) => {

    const iframeClass = `.oono-iframe-${ctx.uuid}`;
    const alreadyAdded = select$1(iframeClass);
    if(alreadyAdded.length){
      ctx.iframe = alreadyAdded[0];
      return;
    }
    // Create an iframe for the stories and set its attributes
    ctx.iframe = create("iframe", {});
    // open iframe
    if(ctx.sessionId){
      setIframeUrl(ctx);
    }

    ctx.iframe.allow = "autoplay";
    ctx.iframe.className = `oono-iframe-${ctx.uuid}`;
    ctx.iframe.style.cssText = "box-sizing:border-box; top: 0px; left: 0px; width: 100%; height: 100%; border: none; outline: 0px; padding: 0px; margin: 0px;";
    ctx.iframeStoriesDiv.appendChild(ctx.iframe);
    //ctx.widgetDiv.appendChild(ctx.iframeStoriesDiv);
    document.body.appendChild(ctx.iframeStoriesDiv);
  };

  

  const eventEmitter = (function (name, ctx) {
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
      showRing(ctx, data?.unseenCount);

    } else {
        hideRing(ctx);
    }
};

const showRing = (ctx, badge) => {
  ctx.elements.forEach((el) => {
    var widgetDiv = el.querySelector(".oono-widget");
    var badgeDiv = el.querySelector(".oono-badge");

    // showing ring
    widgetDiv.style.borderColor = "red";
    widgetDiv.style.borderWidth = `${ctx.width/20}px`;
    widgetDiv.style.borderStyle = "solid";

    // show badge
    badgeDiv.style.display = "flex";
    badgeDiv.innerHTML = badge;
  });
 
};

const hideRing = (ctx) => {

  ctx.elements.forEach((el) => {
    var widgetDiv = el.querySelector(".oono-widget");
    var badgeDiv = el.querySelector(".oono-badge");

    // hiding ring
    widgetDiv.style.borderColor = "lightgrey";
    widgetDiv.style.borderWidth = `${ctx.width/30}px`;
    widgetDiv.style.borderStyle = "solid";

    //hide badge
    badgeDiv.style.display = "none";
  });
  
};

const checkUnseenStories = (ctx) => {
  
    if (!!ctx.requestBusy) {
        return;
    }
    ctx.requestBusy = true;
    if (!ctx.options.tenantId) {
        showHideRing(ctx, null);
        return;
    }
    var requestUrl = `https://${ctx.options.tenantId}.${ctx.host}/api/tenant/stories/have-unseen`;
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
                  console.log("loaded", ctx.container);
                  select$1(".oono-widget").forEach((el) => {
                    el.style.opacity = "1";
                  });
                  showIframe(ctx)
                }, 200);
            }

        }
    });
};



const appendHtml = (ctx) => {
  ctx.elements.forEach((element) => {
    element.innerHTML = "";
    element.appendChild(ctx.widgetDiv.cloneNode(true));
    element.querySelector(".oono-open-story-button").onclick = ctx.openStoryButton.onclick;
  })
}

const addEventListeners = (ctx) => {

  window.addEventListener('message', function (event) {
      // Check if the message is from the iframe
      if (event.source === ctx.iframe.contentWindow) {
          // Log the message sent from the iframe
          if (event.data == 'Escape') {
              closeWindow(ctx);
          }
          // return;
          if(event.data.dragend){
            if(event.data.dragend > 200){
              closeWindow(ctx);
              return;
              
            }
            ctx.iframeStoriesDiv.style.transform = `scale(1) translate3d(0px, 0px, 0px)`;
            ctx.iframeStoriesDiv.style.borderRadius = `0px`;
            ctx.iframeStoriesDiv.style.transition = ``;
           
          }
          const offset = parseInt(event.data.drag/1.4);
          if(offset > 0){
            const scale = 1 - offset*0.6/800;
            ctx.iframeStoriesDiv.style.transform = `translate3d(0px, ${offset}px, 0px) scale(${scale})`;
            ctx.iframeStoriesDiv.style.borderRadius = `10px`;
          }
      }
  });

  // close window on escape
  document.onkeydown = (evt) => {
      //console.log("key down", evt)
      // send event to iframe
      ctx.iframe.contentWindow.postMessage(evt.code, `https://stories.${ctx.host}`);

  };

};

const fetchConfig = async (ctx) => {


  
  
  var requestUrl = `https://${ctx.options.tenantId}.${ctx.host}/api/tenant/get-snippet/${ctx.uuid}?sessionId=${ctx.sessionId}`;
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
  if(!alreadyInitialized(ctx)){
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
    // removed due to an issue
    //setStoryId(ctx, data.firstToWatch);
  }
  if(data.activeStoriesCount != ctx.options.activeStoriesCount || 
    data.unseenCount != ctx.options.unseenCount){
      ctx.options.activeStoriesCount = data.activeStoriesCount;
      ctx.options.unseenCount = data.unseenCount;
      showHideRing(ctx, data);
  }
}

const refresh = async (ctx)  => {
  if(!alreadyInitialized(ctx)){
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
  for(var i = 0; i< ctx.elements.length; i++ ){
    ctx.elements[i].dataset.initialized = false;
    ctx.elements[i].innerHTML = "";
  }
  
  return;
}
  
  const init =  (ctx, allowRefresh = true) => {
    // return new Promise(function ($return, $error) {
      createMainWidget(ctx);
      createBadgeDiv(ctx);
      createIframeBtnDiv(ctx);
      createOpenStoryBtn(ctx);
      createIframeStoriesDiv(ctx);
      createIframe(ctx);
      createCssClass();
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
      
      
    // });
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

  const createCssClass = () => {
    var style = create('style', {});
    style.type = 'text/css';
    style.innerHTML = '.oono-open { overflow: hidden !important; }';
    document.getElementsByTagName('head')[0].appendChild(style);
  };

  const closeWindow = (ctx) => {
    const body = select$1("html")[0];
    body.classList.remove("oono-open");

    ctx.openWindow = false;
    ctx.iframeStoriesDiv.style.transform = `scale(1) translate3d(0px, 2000px, 0px)`;
    ctx.iframeStoriesDiv.style.transition = `transform ease 1s`;
    setTimeout(() => {
      ctx.iframeStoriesDiv.style.display = "none";
      ctx.iframeStoriesDiv.style.transform = ``;
      ctx.iframeStoriesDiv.style.transition = ``;
    }, 1000)
    checkUnseenStories(ctx);
    if(!!ctx.preview){
      return;
    }
    //setIframeUrl(ctx);
    
  }

  const findParentContainer = (btn, className) => {
    var parent = btn.parentNode;
      // Loop until we find a parent element with the desired class or until we reach the top of the DOM
      while (parent !== null && !parent.classList.contains(className)) {
          parent = parent.parentNode;
          if(parent.classList.contains(className)){
            return parent;
          }
      }
      
      return parent.parentNode;
  };

  const openWindow = (ctx, btn) => {
    if (ctx.iframeStoriesDiv) {
      var parentContainer = findParentContainer(btn, "oono-widget");
      if(!parentContainer){
        return console.error("no parent container found");
      }
      const body = select$1("html")[0];
      body.classList.add("oono-open");
      parentContainer.style.opacity = "0.5";
        ctx.openWindow = true;
        console.log(ctx);
        if (ctx.iframeLoaded && ctx.sessionId) {
            setTimeout(() => {
              parentContainer.style.opacity = "1";
              showIframe(ctx);
            }, 200);
        }
    }
  }

  const showIframe = (ctx) => {
    ctx.iframeStoriesDiv.style.display = "inline-block";
    ctx.iframe.contentWindow.postMessage('resume', `https://stories.${ctx.host}`);
    ctx.iframeStoriesDiv.style.transform = `scale(1) translate3d(0px, 0px, 0px)`;
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

  const alreadyInitialized = (ctx) => {
    for(var i = 0; i< ctx.elements.length; i++ ){
      if(!ctx.elements[i].dataset.initialized){
        return false;
      }
    }
    return true;
  }
  const addInitialized = (ctx) => {
    for(var i = 0; i< ctx.elements.length; i++ ){
      ctx.elements[i].dataset.initialized = true;
    }
    return true;
  }

  const filterUninitializedElements = (ctx) => {
    ctx.elements = Array.from(ctx.elements).filter(el => !el.dataset.initialized);
  };
  

  const doInit = async (ctx) => {

    

    // push the object to the objects list
    ctx.elements[0].oonoStories = ctx;
    oonoStories.items.push(ctx);

    filterUninitializedElements(ctx);
    ctx.count = ctx.elements.length;
    ctx.container = ctx.elements;
    addInitialized(ctx);
    ctx.host = typeof ctx.options.host !== "undefined" ? ctx.options.host : defaultHost;
    ctx.width = typeof ctx.options.width !== "undefined" ? ctx.options.width : widgetWidth;
    ctx.height = typeof ctx.options.height !== "undefined" ? ctx.options.height : widgetHeight;
    ctx.autoRefresh = typeof ctx.options.autoRefresh !== "undefined" ? ctx.options.autoRefresh : autoRefresh;
    ctx.preview = typeof ctx.options.preview !== "undefined" ? ctx.options.preview : preview;
    ctx.sessionId = getSessionId();
    ctx.url = window.location.href;
    ctx.timestamp = new Date().getTime();
    ctx.refreshTimer = ctx.options.refreshTimer ? ctx.options.refreshTimer : refreshTimer;
    extend.call(ctx, oonoStories);
    const data = await fetchConfig(ctx);
    if(!data){
      console.error(`invalid config`);
      return false;
    }
    ctx.options = data;
    // debug
    //ctx.options.iframeURL = "http://192.168.1.106:3000/oono";
    
    init(ctx);
    return ctx;
  }

  const initSelector = (ctx) => {
    if(!ctx.options.tenantId){
      console.error(`invalid tenant id `);
      return false;
    }
    
    if(!ctx.options.widgetId){
      console.error(`invalid widget id `);
      return false;
    }
    ctx.selector = ctx.options.selector || "#" + ctx.options.containerId;

    if(!ctx.selector){
      console.error(`invalid selector ${ctx.selector}`);
      return false;
    }
    ctx.uuid = ctx.options.widgetId;
    ctx.elements = select$1(ctx.selector);
    if(!ctx.elements.length){
      console.error(`element does not exists: ${ctx.selector} `);
      return false;
    }    

    return true;    
   
  }
  oonoStories.items = [];
  function oonoStories(config) {
    if(typeof this === "undefined"){
      return false;
    }
    this.options = typeof config === "undefined" ? defaultConfig : config;
    this.id = oonoStories.instances = (oonoStories.instances || 0) + 1;
    this.name = `oonoStories-${this.id}`;
    this.debounce = 0;
    var _this = this;

    let initStatus = initSelector(this);

    if(!initStatus){
      return;
    }

    if(alreadyInitialized(this)){
      console.warn(`the oono element has already been initialized`);
      return this.elements[0].oonoStories;
    }
    doInit(this);

    return this;
  }

  return oonoStories;

}));