/*!
 * oono JavaScript Library v1.1.7
 *
 * Copyright wecansync
 *
 * Date: 2024-02-29T17:08Z
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
      (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.oonoStories = factory());
})(this, (function () {
  'use strict';

  const
    widgetWidth = "66",
    widgetHeight = "66",
    logoMaxWidth = "200",
    refreshTimer = 10000,
    autoRefresh = true,
    preview = false,
    defaultTenant = "oono",
    defaultContainerId = "oono-container",
    defaultHost = "oono.ai",
    ringInterval = null,
    // ringUrl = 'ring-v2-small.gif',
    ringUrl = 'https://oono.ai/assets/images/oono-ring-v2-small.gif',

    defaultConfig = {
      containerId: defaultContainerId,
      tenantId: defaultTenant,
      autoRefresh: true,
      preview: false,
      host: defaultHost,
      width: widgetWidth,
      height: widgetHeight,
      clickOffset: {}
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
      // console.log("timeout 1");
      timer = setTimeout(function () {
        return callback();
      }, duration);
    };
  };

  const createMainWidget = (ctx) => {
    ctx.widgetDiv = create("div", {});
    ctx.widgetDiv.className = "oono-widget";


    if (ctx.options.activeStoriesCount) {
      ctx.widgetDiv.classList.add("with-stories");
    }

  };

  const createRing = (ctx) => {

    var svg = create("div", {});
    svg.className = "oono-svg-stroke";
    // var inner = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="enable-background:new -580 439 577.9 194;"
    //               xml:space="preserve">  
    //             <circle cx="50" cy="50" r="46" />
    //           </svg>`;
    // svg.innerHTML = inner;
    // ctx.widgetDiv.appendChild(svg);
    
    ctx.ringImg = create("img", {});
    ctx.ringImg.className = "oono-ring-animation";
    ctx.ringImg.src = ringUrl;
    svg.appendChild(ctx.ringImg);
    ctx.widgetDiv.appendChild(svg);
  };

  const createBadgeDiv = (ctx) => {
    // Create a div for the story badge
    ctx.badgeDiv = create("div", {});
    ctx.badgeDiv.className = "oono-badge";
    ctx.widgetDiv.appendChild(ctx.badgeDiv);
  };

  const createIframeBtnDiv = (ctx) => {
    ctx.iframeBtnDiv = create("div", {});
    ctx.iframeBtnDiv.className = "oono-iframe-btn";
    
  };

  const createOpenStoryBtn = (ctx) => {
    // Create the story button itself
    ctx.openStoryButton = create("div", {});
    ctx.openStoryButton.className = "oono-open-story-button";
    // Set styles for the button based on the presence of 'showCircle' in ctx.options
    
    // Add click event to show the iframe stories
    ctx.openStoryButton.onclick = function (e) {
      ctx.clickOffset.x = e.clientX;
      ctx.clickOffset.y = e.clientY;
      openWindow(ctx, this);
    };
    // Check if ctx.logoURL is provided in ctx.options
    if (ctx.options.logoURL) {
      // If yes, create an image element and set its attributes
      ctx.logo = create("img", {});
      ctx.logo.className = "logo-img";
      ctx.logo.src = ctx.options.logoURL;
      if (ctx.options.showCircle) {
        ctx.logo.classList.add("show-circle");
      }
      ctx.openStoryButton.appendChild(ctx.logo); // Append the image to the story button
    }
    // Append the story button to the ctx.iframeBtnDiv
    ctx.iframeBtnDiv.appendChild(ctx.openStoryButton);
    ctx.widgetDiv.appendChild(ctx.iframeBtnDiv);
  };

  const createIframeStoriesDiv = (ctx) => {
    // Create a div for the iframe stories
    const iframeClass = `.oono-iframe-stories-${ctx.uuid}`;
    const alreadyAdded = select$1(iframeClass);
    if (alreadyAdded.length) {
      ctx.iframeStoriesDiv = alreadyAdded[0];
      ctx.iframeLoaded = true;
      return;
    }
    ctx.iframeStoriesDiv = create("div", {});
    ctx.iframeStoriesDiv.className = `oono-hide oono-iframe-stories oono-iframe-stories-${ctx.uuid}`;

  };

  const createIframe = (ctx) => {

    const iframeClass = `.oono-iframe-${ctx.uuid}`;
    const alreadyAdded = select$1(iframeClass);
    if (alreadyAdded.length) {
      ctx.iframe = alreadyAdded[0];
      return;
    }
    // Create an iframe for the stories and set its attributes
    ctx.iframe = create("iframe", {});
    // open iframe
    if (ctx.sessionId) {
      setIframeUrl(ctx);
    }

    ctx.iframe.allow = "autoplay";
    ctx.iframe.className = `oono-iframe oono-iframe-${ctx.uuid}`;
    ctx.iframeStoriesDiv.appendChild(ctx.iframe);
  };



  const eventEmitter = (function (name, ctx) {
    ctx.input.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: ctx.feedback,
      cancelable: true
    }));
  });

  const showHideRing = (ctx, data) => {
    if (!ctx.container || ctx.destroyed) {
      return;
    }
    if (!ctx.options?.activeStoriesCount) {
      hideRing(ctx, false);
      return;
    }

    if (
      (typeof data === "undefined" || data.unseenCount) &&
      ctx.options.activeStoriesCount
    ) {
      ctx.unseenCount = data?.unseenCount;
      showRing(ctx, ctx.unseenCount);

    } else {
      if(ctx.options?.activeStoriesCount && (!ctx.unseenCount || !data?.showRing)){
        hideRing(ctx, true);
      }else{
        hideRing(ctx);
      }
      
    }

  };

  const showRing = (ctx, badge, justUnseen) => {

    ctx.elements.forEach((el) => {
      var widgetDiv = el.querySelector(".oono-widget");
      var badgeDiv = el.querySelector(".oono-badge");
      var ring = el.querySelector(".oono-ring-animation");

      
      badgeDiv.innerHTML = badge;
      if (justUnseen) {
        return false;
      }
      

      widgetDiv.classList.remove("show-ring");
      setTimeout(() => {
        widgetDiv.classList.add("show-ring");
        widgetDiv.classList.add("with-stories");
        widgetDiv.classList.remove("stories-seen");
      }, 100);
      
     
      // restart animation
      ring.src = ring.src;

    });

  };

  const hideRing = (ctx, showBorder) => {

    if (typeof showBorder === 'undefined') {
      var showBorder = true;
    }
    clearInterval(ctx.ringInterval);
    ctx.ringInterval = null;

    ctx.elements.forEach((el) => {
      var widgetDiv = el.querySelector(".oono-widget");
      
      widgetDiv.classList.remove("show-ring");

      if (showBorder) {
        // hiding ring
        widgetDiv.classList.add("stories-seen");
      }else{
        widgetDiv.classList.remove("with-stories");
      }

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
    var requestUrl = `${ctx.options.scheme}${ctx.options.tenantId}.${ctx.host}/api/tenant/stories/have-unseen?brand=${ctx.options.brand}`;
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
          if (ctx.destroyed) {
            return false;
          }
          if (!ctx.sessionId) {
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
    if (typeof story === "undefined") {
      var story = 0;
    }
    const prev = ctx.preview ? 1 : 0;
    const rtl = ctx.options.is_rtl ? 1 : 0;
    ctx.iframe.src = `${ctx.options.iframeURL}?brand=${ctx.options.brand}&session=${ctx.sessionId}&url=${ctx.url}&preview=${prev}&closeBtn=1&resume=0&storyId=${story}&rtl=${rtl}`;
  };

  const handleIframeLoaded = (ctx) => {
    if (!ctx.container) {
      return;
    }
    // iframe load listener
    ctx.iframe.onload = function () {
      if (!this.src || this.src == window.location.href) {
        return;
      }
      // The iframe has finished loading
      if (ctx.iframeStoriesDiv) {
        ctx.iframeLoaded = true;
        if (ctx.openWindow) {
          select$1(".oono-widget").forEach((el) => {
            el.style.opacity = "1";
          });
          showIframe(ctx)
        }

      }
    };
  };



  const appendHtml = (ctx) => {
    ctx.elements.forEach((element) => {
      element.innerHTML = "";
      element.appendChild(ctx.widgetDiv.cloneNode(true));
      element.querySelector(".oono-open-story-button").onclick = ctx.openStoryButton.onclick;
    })
    // ctx.elements[0].appendChild(ctx.iframeStoriesDiv);
    document.body.appendChild(ctx.iframeStoriesDiv);
  }

  const onMessageEvent = (event, ctx) => {
    // Check if the message is from the iframe
    if (event.source === ctx.iframe.contentWindow) {
      // Log the message sent from the iframe
      if (event.data == 'Escape') {
        closeWindow(ctx);
      }
      // return;
      if (event.data.dragend) {
        if (event.data.dragend > 200) {
          closeWindow(ctx);
          return;
        }
        ctx.iframeStoriesDiv.style.transform = `scale(1) translate3d(0px, 0px, 0px)`;
        ctx.iframeStoriesDiv.style.borderRadius = `0px`;
        ctx.iframeStoriesDiv.style.transition = ``;
      }
      const offset = parseInt(event.data.drag / 1.4);
      if (offset > 0) {
        const scale = 1 - offset * 0.6 / 800;
        ctx.iframeStoriesDiv.style.transform = `translate3d(0px, ${offset}px, 0px) scale(${scale})`;
        ctx.iframeStoriesDiv.style.borderRadius = `10px`;
      }
    }
  }

  const onKeydownEvent = (evt, ctx) => {
    // console.log("key down", evt)
    // send event to iframe
    postMessage(ctx, { type: evt.code });

  }

  const addEventListeners = (ctx) => {
    // console.log("Adding events");
    const evt1 = (event) => {
      onMessageEvent(event, ctx);
    };

    const evt2 = (event) => {
      onKeydownEvent(event, ctx);
    };

    window.addEventListener('message', evt1);
    // close window on escape
    document.addEventListener("keydown", evt2);

  };

  const removeEventListeners = (ctx) => {
    // console.log("Removing events");
    const evt1 = (event) => {
      onMessageEvent(event, ctx);
    };

    const evt2 = (event) => {
      onKeydownEvent(event, ctx);
    };

    window.removeEventListener('message', evt1);
    // close window on escape
    document.removeEventListener("keydown", evt2);
  };

  const fetchConfig = async (ctx) => {
    try {
      const requestUrl = `${ctx.options.scheme}${ctx.options.tenantId}.${ctx.host}/api/tenant/get-snippet/${ctx.uuid}?sessionId=${ctx.sessionId}&first=${ctx.firstLoad}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch config');
      }
      const data = await response.json();
      if (data && data.status && data.data) {
        return data.data;
      } else {
        throw new Error('Invalid data received');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      return null;
    }
  };

  const doRefresh = async (ctx) => {
    if (!alreadyInitialized(ctx)) {
      return false;
    }
    console.log("refreshing ring");
    const data = await fetchConfig(ctx);
    if (!data) {
      return false;
    }
    if (ctx.destroyed) {
      return;
    }
    if (data.logoURL != ctx.options.logoURL) {
      ctx.options = data;
      return init(ctx, false);
    }
    ctx.options.firstToWatch = data.firstToWatch;
    if (data.firstToWatch) {
      // removed due to an issue
      //setStoryId(ctx, data.firstToWatch);
    }
    if (data.activeStoriesCount != ctx.options.activeStoriesCount ||
      data.unseenCount != ctx.options.unseenCount) {
      ctx.options.activeStoriesCount = data.activeStoriesCount;
      ctx.options.unseenCount = data.unseenCount;
      showHideRing(ctx, data);
    }
  }

  const refresh = async (ctx) => {
    if (!alreadyInitialized(ctx)) {
      return false;
    }
    if (ctx.destroyed) {
      return;
    }
    if (!ctx.openWindow) {
      await doRefresh(ctx);
    }
    var refTimer = debounce(() => {
      refresh(ctx)
    }, ctx.refreshTimer)
    if (ctx.autoRefresh) {
      refTimer();
    }
  }

  const destroy = (ctx) => {
    for (var i = 0; i < ctx.elements.length; i++) {
      ctx.elements[i].dataset.initialized = false;
      ctx.elements[i].innerHTML = "";
    }
    ctx.destroyed = true;
    clearInterval(ctx.ringInterval);
    removeEventListeners(ctx);

    return;
  }

  const init = (ctx, allowRefresh = true) => {
    ctx.destroyed = false;
    // return new Promise(function ($return, $error) {
    createMainWidget(ctx);
    createRing(ctx);
    createBadgeDiv(ctx);
    createIframeBtnDiv(ctx);
    createOpenStoryBtn(ctx);
    createIframeStoriesDiv(ctx);
    createIframe(ctx);
    createCssClasses(ctx);
    handleIframeLoaded(ctx);
    appendHtml(ctx);
    addEventListeners(ctx);
    if (ctx.options.activeStoriesCount) {
      checkUnseenStories(ctx);
    } else {
      showHideRing(ctx, null);
    }
    if (allowRefresh) {
      
      var autoRefresh = debounce(() => {
        refresh(ctx)
      }, ctx.refreshTimer)
      if (ctx.autoRefresh) {
        autoRefresh();
      }
    }


    // });
  }

  const setStoryId = (ctx, id) => {
    if (ctx.openWindow) {
      return console.warn("window opened!");
    }
    if (!ctx.iframe) {
      return console.error("iframe not exists");
    }
    //setIframeUrl(ctx, id);
    ctx.activeStory = id;
  }

  function extend(oonoStories) {
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
      if (!this.openStoryButton) {
        return console.error('No open button found');
      }
      this.openStoryButton.click();
    };
    prototype.close = function () {
      postMessage(this, { type: "Escape" });
      closeWindow(this);
    };
  }

  const createCssClasses = (ctx) => {
    var style = create('style', {});
    style.type = 'text/css';
    const width = `${ctx.width}px`;
    const height = `${ctx.height}px`;
    const fontSize = `${ctx.width / 5}px`;
    const maxWidth = `${logoMaxWidth}px`;
    style.innerHTML = `

     

      ${ctx.selector} .oono-widget {
          position: relative;
          cursor: pointer;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          height: auto;
          width: auto;
      }

      
      ${ctx.selector} .oono-widget.with-stories {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${height};
          width: ${width};
      }
      
      
      ${ctx.selector} .oono-badge {
          display: none;
          box-sizing: border-box;
          width: 28%;
          height: 28%;
          align-items: center;
          justify-content: center;
          position: absolute;
          background: red;
          top: 0;
          right: 0;
          padding: 0px;
          border-radius: 50%;
          color: white;
          font-size: ${fontSize};
          line-height: ${fontSize};
          font-weight: bold;
          font-family: system-ui;
          z-index: 1;
      }

      ${ctx.selector} .show-ring .oono-badge {
        display: flex;
      }
      
      
      ${ctx.selector} .oono-iframe-btn {
          width: 100%;
          height: auto;
          box-sizing: border-box;
      }
      
      ${ctx.selector} .with-stories .oono-iframe-btn {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 9%;
      }
      
      ${ctx.selector} .with-stories.stories-seen .oono-iframe-btn {
          border: solid 2px lightgray;
          padding: calc(9% - 2px);
      }
      
      ${ctx.selector} .oono-open-story-button {
          box-sizing: border-box;
          width: 100%;
          height: auto;
      }
      
      ${ctx.selector} .with-stories .oono-open-story-button {
          box-sizing: border-box;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: solid 1px lightgrey;
      }
      
      ${ctx.selector} .logo-img {
          width: 100%;
          height: auto;
          object-fit: cover;
          max-width: ${maxWidth};
          scale: 1.05;
      }
      
      ${ctx.selector} .logo-img.show-circle {
          height: 100%;
      }
      
      .oono-iframe-stories {
          overflow: hidden;
          box-sizing: border-box;
          position: fixed;
          top: 0px;
          left: 0px;
          width: 100vw;
          height: 100vh;
          z-index: 999999999;
          border: none;
          outline: 0px;
          padding: 0px;
          margin: 0px;
          margin-left: auto;
          margin-right: auto;
          bottom: constant(safe-area-inset-bottom);
          bottom: env(safe-area-inset-bottom);
      }
      
      .oono-iframe {
          box-sizing: border-box;
          top: 0px;
          left: 0px;
          width: 100%;
          height: 100%;
          border: none;
          outline: 0px;
          padding: 0px;
          margin: 0px;
      }
      
      .oono-hide {
        visibility:hidden !important;
      }
      
      
      
      
      
      ${ctx.selector} .oono-open {
          overflow: hidden !important;
      }
      
      ${ctx.selector} .oono-svg-stroke {
          position: absolute;
          width: calc(100%);
          height: calc(100%);
          top: 0;
          left: 0;
          box-sizing: border-box;
          display: none;
      }

      ${ctx.selector} .oono-svg-stroke img{
        width: 100%;
        height: 100%;
        position: relative;
        top: 0;
        left: 0;
      }
      
      ${ctx.selector} .show-ring .oono-svg-stroke {
          display: block;
      }
      
      ${ctx.selector} .oono-svg-stroke svg {
          fill: none;
          stroke: red;
          stroke-linecap: round;
          stroke-width: 5%;
          /* stroke-dasharray: 50;  */
          /* stroke-dashoffset: 0; */
          /* animation: stroke-draw 3s ease-in-out alternate; */
          display:none;
      }
      
      ${ctx.selector} .oono-badge {
          animation: bubble .3s ease-in-out alternate;
          animation-delay: 2s;
          animation-fill-mode: both;
      }
      
      
      
      ${ctx.selector} .close-window {
          animation: close-window .3s ease-in-out alternate;
      }
      
      @keyframes stroke-draw {
          0% {
              stroke-dasharray: 20;
              transform: rotate(0deg);
          }
      
          100% {
              stroke-dasharray: 0;
              transform: rotate(-720deg);
          }
      }
      
      @keyframes bubble {
          0% {
              transform: scale(0);
          }
      
          50% {
              transform: scale(1.8);
          }
      
          75% {
              transform: scale(0.4);
          }
      
          100% {
              transform: scale(1);
          }
      }
      
      @keyframes close-window {
          0% {
              display: none;
              border-radius: 50%;
              opacity: 0.2;
              transform: translate(0, 20%);
          }
      
          25% {
              opacity: 0.15;
              border-radius: 50%;
              transform: translate(0, 30%);
          }
      
          50% {
              opacity: 0.10;
              border-radius: 50%;
              transform: translate(0, 20%);
          }
      
          75% {
              opacity: 0.05;
              border-radius: 50%;
      
      
          }
      
          100% {
              display: none;
              width: 0;
              height: 0;
              opacity: 0;
              border-radius: 50%;
      
          }
      
      }
      
    `;
    document.getElementsByTagName('head')[0].appendChild(style);

    
  };

  const closeWindow = (ctx) => {
    const body = select$1("html")[0];
    body.classList.remove("oono-open");

    ctx.openWindow = false;

    var top = ctx.clickOffset.y;;
    var left = ctx.clickOffset.x;;

    ctx.iframeStoriesDiv.classList.add("close-window");
    ctx.iframe.style.width = `100%`;
    ctx.iframe.style.height = `100%`;
    ctx.iframeStoriesDiv.classList.add("oono-hide");
    ctx.iframeStoriesDiv.style.width = `100vw`;
    ctx.iframeStoriesDiv.style.height = `100vh`;

    ctx.iframeStoriesDiv.style.transform = `translate3d(${left}px,${top}px, 0)`;
   
    ctx.iframeStoriesDiv.classList.remove("close-window");
    ctx.iframeStoriesDiv.style.transform = ``;
    ctx.iframeStoriesDiv.style.transition = ``;

    checkUnseenStories(ctx);
    if (!!ctx.preview) {
      return;
    }

  }

  const findParentContainer = (btn, className) => {
    var parent = btn.parentNode;
    // Loop until we find a parent element with the desired class or until we reach the top of the DOM
    while (parent !== null && !parent.classList.contains(className)) {
      parent = parent.parentNode;
      if (parent.classList.contains(className)) {
        return parent;
      }
    }

    return parent.parentNode;
  };

  const openWindow = (ctx, btn) => {
    if (ctx.iframeStoriesDiv) {
      var parentContainer = findParentContainer(btn, "oono-widget");
      if (!parentContainer) {
        return console.error("no parent container found");
      }
      const body = select$1("html")[0];
      body.classList.add("oono-open");
      parentContainer.style.opacity = "0.5";
      ctx.openWindow = true;
      if (ctx.iframeLoaded && ctx.sessionId) {
        parentContainer.style.opacity = "1";
        showIframe(ctx);
      }
    }
  }

  const showIframe = (ctx) => {
    ctx.iframeStoriesDiv.classList.remove("oono-hide");
    postMessage(ctx, { type: 'resume', storyId: ctx.activeStory });
    ctx.iframeStoriesDiv.style.transform = `scale(1) translate3d(0px, 0px, 0px)`;
  }

  const postMessage = (ctx, data) => {
    data.tenant = ctx.options.tenantId;
    ctx.iframe.contentWindow.postMessage(data, `${ctx.options.iframeURL}`);
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
    if (!session) {
      session = makeSessionId(15);
    }
    return session;
  };

  const alreadyInitialized = (ctx) => {
    for (var i = 0; i < ctx.elements.length; i++) {
      if (!ctx.elements[i].dataset.initialized || ctx.elements[i].dataset.initialized == 'false') {
        return false;
      }
    }
    return true;
  }
  const addInitialized = (ctx) => {
    for (var i = 0; i < ctx.elements.length; i++) {
      ctx.elements[i].dataset.initialized = true;
    }
    return true;
  }

  const filterUninitializedElements = (ctx) => {
    ctx.elements = Array.from(ctx.elements).filter(el => (!el.dataset.initialized || el.dataset.initialized == 'false'));
  };


  const doInit = async (ctx) => {



    // push the object to the objects list
    ctx.elements[0].oonoStories = ctx;
    oonoStories.items.push(ctx);

    filterUninitializedElements(ctx);
    ctx.count = ctx.elements.length;
    ctx.container = ctx.elements;
    addInitialized(ctx);
    ctx.clickOffset = {};
    ctx.host = typeof ctx.options.host !== "undefined" ? ctx.options.host : defaultHost;
    ctx.ringInterval = ringInterval;
    ctx.width = typeof ctx.options.width !== "undefined" ? ctx.options.width : widgetWidth;
    ctx.height = typeof ctx.options.height !== "undefined" ? ctx.options.height : widgetHeight;
    ctx.autoRefresh = typeof ctx.options.autoRefresh !== "undefined" ? ctx.options.autoRefresh : autoRefresh;
    ctx.preview = typeof ctx.options.preview !== "undefined" ? ctx.options.preview : preview;
    ctx.sessionId = getSessionId();
    ctx.url = window.location.href;
    ctx.timestamp = new Date().getTime();
    ctx.refreshTimer = ctx.options.refreshTimer ? ctx.options.refreshTimer : refreshTimer;
    extend.call(ctx, oonoStories);
    ctx.firstLoad = 0;
    if (!ctx.preview) {
      ctx.firstLoad = 1;
    }

    const data = await fetchConfig(ctx);
    if (!data) {
      console.error('Invalid config');
      return false;
    }

    ctx.options = data;
    ctx.firstLoad = 0;

    // debug
    // ctx.options.iframeURL = "http://oono.myoono.local:3000/";
    if (ctx.destroyed) {
      return ctx;
    }
    init(ctx);
    return ctx;

  }

  const initSelector = (ctx) => {
    if (!ctx.options.tenantId) {
      console.error(`invalid tenant id `);
      return false;
    }

    if (!ctx.options.widgetId) {
      console.error(`invalid widget id `);
      return false;
    }
    ctx.selector = ctx.options.selector || "#" + ctx.options.containerId;

    if (!ctx.selector) {
      console.error(`invalid selector ${ctx.selector}`);
      return false;
    }
    ctx.uuid = ctx.options.widgetId;
    ctx.elements = select$1(ctx.selector);
    if (!ctx.elements.length) {
      console.error(`element does not exists: ${ctx.selector} `);
      return false;
    }

    return true;

  }
  oonoStories.items = [];
  function oonoStories(config) {
    if (typeof this === "undefined") {
      return false;
    }
    this.options = typeof config === "undefined" ? defaultConfig : config;
    this.id = oonoStories.instances = (oonoStories.instances || 0) + 1;
    this.name = `oonoStories-${this.id}`;
    this.debounce = 0;
    var _this = this;
    let initStatus = initSelector(this);

    if (!initStatus) {
      return;
    }

    if (alreadyInitialized(this)) {
      console.warn(`the oono element has already been initialized`);
      return this.elements[0].oonoStories;
    }
    doInit(this);

    return this;
  }

  return oonoStories;

}));