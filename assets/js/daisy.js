let dyLenis = null;

$(function() {
    dyLenisAction();
    dyGnbAction();
    dyVisualSlider();
    dyIntroAction();
    dyEventSlider();
    dyEventReveal();
    dyConcernSlider();
    dyCareSlider();
    dyEquipSlider();
    dyDailyAction();
    dyDoctorSlider();
    dySpaceSlider();
    dyBaSlider();
    dyFaqAction();
    dyTabAction();
    dyCateAction();
    dyChipAction();
});

/* GNB: 서브 메뉴가 있는 항목 진입 시 열림, GNB + 서브 영역 이탈 시 닫힘 */
function dyGnbAction(){
    const $header = $("#header"),
        $item = $header.find(".dy-gnb-item"),
        $subList = $header.find(".dy-gnb-sub-list");

    function open($target){
        const key = $target.data("sub");
        $item.removeClass("on");
        if(!key) return close();
        $target.addClass("on");
        $subList.removeClass("on").filter("[data-sub='" + key + "']").addClass("on");
        $header.addClass("on");
    }
    /* 서브 리스트의 .on 은 유지: 닫히는 동안 fade-out 되도록 내용을 남겨둠 */
    function close(){
        $header.removeClass("on");
        $item.removeClass("on");
    }

    $item.on("mouseenter focusin", function(){ open($(this)); });
    $header.on("mouseleave", close);
    $header.on("focusout", function(e){
        if(!$header[0].contains(e.relatedTarget)) close();
    });
}

/* 슬라이드 번호 (01 / 12) 갱신 */
function dyCountUpdate($count, swiper){
    const total = swiper.slides.length,
        cur = swiper.activeIndex + 1;
    $count.find(".cur").text(cur < 10 ? "0" + cur : cur);
    $count.find(".total").text(total < 10 ? "0" + total : total);
}

/* 진행 바: 보이는 개수 / 전체 개수 비율로 이동 (전체가 보이면 고정) */
function dyProgressUpdate($progress, swiper, isFit){
    const $bar = $progress.find(".dy-progress-bar");
    /* isFit: 막대 길이를 (보이는 개수 / 전체 개수) 비율로 맞춤 */
    if(isFit) $bar.css("width", Math.min(swiper.params.slidesPerView / swiper.slides.length, 1) * 100 + "%");
    const move = $progress.width() - $bar.width();
    $bar.css("transform", "translateX(" + (move * Math.min(Math.max(swiper.progress, 0), 1)) + "px)");
}

function dyVisualSlider(){
    const $slider = $(".dy-visual-slider");
    if(!$slider.length) return;
    const $count = $(".dy-visual-count");
    const swiper = new Swiper($slider[0], {
        speed:600,
        autoplay:{delay:4000, disableOnInteraction:false},
        navigation:{nextEl:".dy-visual-next", prevEl:".dy-visual-prev"},
        on:{
            init:function(){ dyCountUpdate($count, this); },
            slideChange:function(){ dyCountUpdate($count, this); }
        }
    });
    dyAutoplayInView($slider[0], swiper);
}

function dyEventSlider(){
    const $slider = $(".dy-event-slider");
    if(!$slider.length) return;
    /* breakpoints: Swiper 4 는 키 값 "이하(max-width)" 기준 */
    /* 태블릿·모바일: 활성 슬라이드 가운데 정렬 (첫 슬라이드 왼쪽이 비지 않도록 loop) */
    new Swiper($slider[0], {slidesPerView:2, spaceBetween:20, speed:500, grabCursor:true, loop:true, loopedSlides:6,
        breakpoints:{
            767:{slidesPerView:1.2, spaceBetween:12, centeredSlides:true},
            1279:{slidesPerView:1.6, spaceBetween:20, centeredSlides:true}
        }
    });
}

function dyConcernSlider(){
    const $slider = $(".dy-concern-slider");
    if(!$slider.length) return;
    /* 노출 개수가 바뀌면 CSS 의 --dy-concern-card 계산식도 함께 맞춤 (daisy.css 반응형) */
    const swiper = new Swiper($slider[0], {slidesPerView:5, spaceBetween:20, centeredSlides:true, loop:true, initialSlide:2, slideToClickedSlide:true, speed:500, grabCursor:true, autoplay:{delay:3000, disableOnInteraction:false},
        breakpoints:{
            767:{slidesPerView:1.6, spaceBetween:12},
            1023:{slidesPerView:3, spaceBetween:20}
        }
    });
    dyAutoplayInView($slider[0], swiper);
}

/* 자동 재생 슬라이더는 해당 섹션이 화면에 노출됐을 때만 재생, 섹션이 화면 밖으로 나가면 정지
   (화면 밖에서 계속 돌며 레이아웃/애니메이션 비용을 쓰지 않도록). 섹션 높이의 20% 이상 보이면 노출로 판단 */
function dyAutoplayInView(el, swiper){
    if(!swiper || !swiper.autoplay || !("IntersectionObserver" in window)) return;
    const target = $(el).closest("section")[0] || el;
    swiper.autoplay.stop();
    new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
            if(entry.isIntersecting) swiper.autoplay.start();
            else swiper.autoplay.stop();
        });
    }, {threshold:0.2}).observe(target);
}

function dyEquipSlider(){
    const $slider = $(".dy-equip-slider");
    if(!$slider.length) return;
    /* .on 자리는 항상 첫 번째 카드(왼쪽). 3초마다 카드 줄이 한 칸씩 돌아감:
       - 첫 카드(.on)는 154px 로 접히며 왼쪽 밖으로, 다음 카드는 1024px 로 펼쳐지며 첫 자리로 이동
       - 줄은 접힌 카드 한 칸(154 + 간격 20 = 174px)만큼 왼쪽으로 이동 → 폭 변화와 이동이 같은 시간·easing 이라 위치가 어긋나지 않음
       - 오른쪽 끝이 비지 않도록 떠나는 카드를 미리 뒤에 복제해 두고, 이동이 끝나면 원본을 지우고 위치를 0 으로 되돌림
       - 카드 클릭: 그 카드가 첫 자리로 올 때까지 한 번에 이동 (펼쳐진 첫 카드는 링크 그대로 동작)
       - 마우스를 올리면 일시정지, 섹션이 화면 밖이면 정지 */
    const $list = $slider.find(".dy-equip-list");
    if($list.children(".dy-equip-item").length < 2) return;
    /* 한 칸 이동 거리 = 접힌 카드 폭 + 간격. 반응형에서 폭·간격이 달라지므로 이동 시점에 실제 값으로 계산 (PC 154 + 20 = 174px) */
    const SPEED = 600;
    function getStep($items){
        return $items.eq(1).outerWidth() + (parseFloat($list.css("column-gap")) || 0);
    }
    let timer = null,
        busy = false,
        inView = !("IntersectionObserver" in window),
        hover = false;

    $list.children(".dy-equip-item").removeClass("on").first().addClass("on");
    $list.css({transition:"transform " + SPEED + "ms ease", transform:"translateX(0)"});

    function go(k){
        const $items = $list.children(".dy-equip-item");
        if(busy || k < 1 || k >= $items.length) return;
        busy = true;
        const STEP = getStep($items);
        const $leaving = $items.slice(0, k);
        /* 떠나는 카드를 접힌 상태로 뒤에 복제 (오른쪽 빈 공간 방지) */
        $leaving.clone().removeClass("on").appendTo($list);
        $items.eq(0).removeClass("on");
        $items.eq(k).addClass("on");
        $list.css("transform", "translateX(" + (-STEP * k) + "px)");

        /* 정리(원본 제거 + 위치 0)는 줄 이동이 "실제로 끝난 뒤"에 실행.
           고정 시간(setTimeout)으로 하면 화면 갱신이 느린 환경에서 폭 애니메이션이 덜 끝난 채 정리되어 튐.
           transitionend 가 오지 않는 경우를 대비한 예비 타이머 포함 */
        let done = false;
        const listEl = $list[0];
        function finish(){
            if(done) return;
            done = true;
            listEl.removeEventListener("transitionend", onEnd);
            clearTimeout(fallback);
            $leaving.remove();
            $list.css({transition:"none", transform:"translateX(0)"});
            listEl.offsetWidth; /* 위치 초기화를 즉시 반영 */
            $list.css("transition", "transform " + SPEED + "ms ease");
            busy = false;
        }
        function onEnd(e){
            if(e.target === listEl && e.propertyName === "transform") finish();
        }
        listEl.addEventListener("transitionend", onEnd);
        const fallback = setTimeout(finish, SPEED + 2000);
    }
    /* 이전 카드: 마지막 카드를 접힌 상태로 맨 앞에 복제하고 한 칸(-STEP) 당겨 둔 뒤,
       복제 카드를 펼치며 위치를 0 으로 이동 (go 와 반대 방향, 같은 시간·easing).
       이동이 끝나면 맨 뒤의 원본을 제거 → 이동 중 오른쪽 끝이 비지 않음 */
    function goPrev(){
        const $items = $list.children(".dy-equip-item");
        if(busy || $items.length < 2) return;
        busy = true;
        const STEP = getStep($items),
            $last = $items.last(),
            $clone = $last.clone().removeClass("on").prependTo($list);
        $list.css({transition:"none", transform:"translateX(" + (-STEP) + "px)"});
        $list[0].offsetWidth; /* 시작 위치 즉시 반영 */
        $list.css({transition:"transform " + SPEED + "ms ease", transform:"translateX(0)"});
        $items.eq(0).removeClass("on");
        $clone.addClass("on");

        let done = false;
        const listEl = $list[0];
        function finish(){
            if(done) return;
            done = true;
            listEl.removeEventListener("transitionend", onEnd);
            clearTimeout(fallback);
            $last.remove();
            busy = false;
        }
        function onEnd(e){
            if(e.target === listEl && e.propertyName === "transform") finish();
        }
        listEl.addEventListener("transitionend", onEnd);
        const fallback = setTimeout(finish, SPEED + 2000);
    }
    function stop(){ clearInterval(timer); timer = null; }
    function play(){
        stop();
        if(inView && !hover) timer = setInterval(function(){ go(1); }, 3000);
    }

    /* 마우스 드래그 / 터치 스와이프: 왼쪽으로 끌면 다음, 오른쪽으로 끌면 이전 (40px 이상 이동 시) */
    const DRAG_MIN = 40;
    let startX = null,
        dragged = false;
    $slider.on("dragstart", function(e){ e.preventDefault(); }); /* 이미지·링크 기본 드래그 방지 */
    $slider.on("pointerdown", function(e){
        if(e.pointerType === "mouse" && e.button !== 0) return;
        startX = e.clientX;
        dragged = false;
    });
    $(document).on("pointerup pointercancel", function(e){
        if(startX === null) return;
        const dx = e.type === "pointerup" ? e.clientX - startX : 0;
        startX = null;
        if(Math.abs(dx) < DRAG_MIN) return;
        dragged = true; /* 드래그 직후 발생하는 click 으로 링크 이동·카드 선택이 되지 않도록 */
        if(dx < 0) go(1);
        else goPrev();
        play();
    });

    $list.on("click", ".dy-equip-item a", function(e){
        if(dragged){
            dragged = false;
            e.preventDefault();
            return;
        }
        const k = $list.children(".dy-equip-item").index($(this).closest(".dy-equip-item"));
        if(k === 0) return;
        e.preventDefault();
        go(k);
        play();
    });
    $slider.on("mouseenter", function(){ hover = true; stop(); })
        .on("mouseleave", function(){ hover = false; play(); });

    if("IntersectionObserver" in window){
        new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                inView = entry.isIntersecting;
                play();
            });
        }, {threshold:0.2}).observe($slider.closest("section")[0] || $slider[0]);
    }
    play();
}

/* DAISY DAILY: 목록을 한 번 더 복제해 CSS 애니메이션(-50% 이동)으로 끊김 없이 흐르게 함 */
function dyDailyAction(){
    const $list = $(".dy-daily-list");
    if(!$list.length || $list.data("cloned")) return;
    const $clone = $list.children().clone().attr("aria-hidden", "true");
    $clone.find("a").attr("tabindex", "-1");
    $list.append($clone).data("cloned", true);

    /* 화면 밖에서는 흐르는 애니메이션을 일시정지 */
    if("IntersectionObserver" in window){
        new IntersectionObserver(function(entries){
            entries.forEach(function(entry){
                $list.toggleClass("is-paused", !entry.isIntersecting);
            });
        }, {rootMargin:"100px 0px"}).observe($list.closest(".dy-daily-area")[0] || $list[0]);
    }
}

/* 의원 소개·인기시술 검색: 화면에 들어오면 아래에서 위로 등장 (1회, 섹션별로 각각 감지)
   섹션에 dy-ani-ready 를 붙이고, 안쪽 텍스트·영역의 애니메이션은 CSS 에서 지정 */
function dyIntroAction(){
    dyRevealGroups([$(".sect-dy-intro"), $(".sect-dy-search")], "dy-ani-ready");
}

/* 화면 노출 애니메이션 대상 (아래에서 위로, 1회)
   - 이벤트: 타이틀 → (슬라이더 + 리스트 동시)
   - 피부 고민: 타이틀 → 슬라이더 (각각)
   - DAISY CARE: 타이틀 → 슬라이더 (각각)
   - 장비: 타이틀 → 슬라이더 (각각)
   - 의료진: 섹션 단위 감지, 타이틀 → 안내 문구 → 슬라이더 순서는 CSS 지연값으로 지정 (dy-ani-ready)
   - 공간: 섹션 단위 감지, 타이틀 블러 페이드인 → 슬라이더 영역 위로 등장 (CSS 에서 지정, dy-ani-ready)
   - 필름: 섹션 전체
   - DAISY DAILY: 섹션 전체
   - 전후 사진: 타이틀 → 슬라이더 (각각)
   - 저널: 타이틀 → 탭 영역 (각각)   - FAQ: 섹션 전체
   - 오시는 길: 타이틀 → (지도 + 패널) (각각)
   - 배너 텍스트: 흐릿한 상태에서 선명해지며 페이드인 (배너마다 각각, dy-blur-ready) */
function dyEventReveal(){
    dyRevealGroups([
        $(".dy-event-head"),
        $(".dy-event-slider, .dy-event-row-list")
    ]);
    dyRevealGroups([
        $(".sect-dy-concern .dy-tit-area"),
        $(".dy-concern-slider")
    ]);
    dyRevealGroups([
        $(".sect-dy-care .dy-tit-area"),
        $(".dy-care-slider")
    ]);
    dyRevealGroups([
        $(".sect-dy-equip .dy-tit-area"),
        $(".sect-dy-equip .dy-equip-slider")
    ]);
    dyRevealGroups([$(".sect-dy-doctor")], "dy-ani-ready");
    dyRevealGroups([$(".sect-dy-space")], "dy-ani-ready");
    dyRevealGroups([$(".sect-dy-film")]);
    dyRevealGroups([$(".sect-dy-daily")]);
    dyRevealGroups([
        $(".sect-dy-ba .dy-tit-area"),
        $(".sect-dy-ba .dy-ba-slider")
    ]);
    dyRevealGroups([
        $(".sect-dy-journal .dy-tit-area"),
        $(".sect-dy-journal .dy-journal-tab-area")
    ]);    dyRevealGroups([$(".sect-dy-faq")]);
    dyRevealGroups([
        $(".sect-dy-visit .dy-tit-area"),
        $(".sect-dy-visit .dy-visit-area")
    ]);
    dyRevealGroups($(".dy-banner-txt").toArray().map(function(el){ return $(el); }), "dy-blur-ready");}

/* 그룹 단위 노출: 그룹의 첫 요소 윗부분이 화면 아래 1/3 지점(화면 높이의 2/3)에 닿으면 그룹 전체를 함께 노출
   - 같은 순간 함께 노출되는 그룹끼리 0.2s 간격으로 지연 (list 순서 = 노출 순서)
   - 스크롤 위치로 판단하므로 이미 지나간 요소도 노출 (중간 위치 새로고침·앵커 이동 시 숨겨진 채 남지 않음)
   - readyClass(기본 dy-up-ready): JS 가 동작할 때만 붙여 미리 숨김 → JS 미동작 시 그대로 노출
   - 동작 줄이기 설정 사용자는 애니메이션 없이 노출 */
function dyRevealGroups(list, readyClass){
    let pending = list.filter(function($g){ return $g.length; });
    if(!pending.length) return;
    if(window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    pending.forEach(function($g){ $g.addClass(readyClass || "dy-up-ready"); });

    let ticking = false;
    function check(){
        ticking = false;
        const line = window.innerHeight * 2 / 3;
        let order = 0;
        pending = pending.filter(function($g){
            if($g[0].getBoundingClientRect().top >= line) return true;
            $g.css("animation-delay", (order++ * 0.2) + "s").addClass("is-show");
            return false;
        });
        if(!pending.length){
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
        }
    }
    function onScroll(){
        if(ticking) return;
        ticking = true;
        requestAnimationFrame(check);
    }
    window.addEventListener("scroll", onScroll, {passive:true});
    window.addEventListener("resize", onScroll);
    check();
}


/* DAISY CARE: 현재 보이는 슬라이드(활성 + 다음) 2개만 .on → 텍스트 노출, 나머지는 이미지만.
   텍스트 유무로 슬라이드 폭이 달라지므로 .on 갱신 후 update() 로 위치 재계산.
   loop 복제 슬라이드는 원본과 상태가 같도록 data-swiper-slide-index(원본 순번) 기준으로 판단 */
function dyCareSlider(){
    const $slider = $(".dy-care-slider");
    if(!$slider.length) return;

    /* wrap: 마지막 슬라이드가 활성일 때 루프로 이어지는 1번 슬라이드까지 포함할지 여부
       (이동 중에는 제외하고, 마지막 슬라이드가 자리에 도착한 뒤에 1번 텍스트를 펼침) */
    /* 태블릿·모바일(1279 이하)은 활성 슬라이드 1개만 텍스트 노출 */
    const mqSingle = window.matchMedia("(max-width:1279px)");
    function textOnIndex(swiper, wrap){
        const total = $(swiper.slides).not(".swiper-slide-duplicate").length,
            cur = Number($(swiper.slides).eq(swiper.activeIndex).attr("data-swiper-slide-index"));
        if(mqSingle.matches) return [cur];
        return cur + 1 < total || wrap ? [cur, (cur + 1) % total] : [cur];
    }
    /* 펼침(이동 시작 즉시): 레이아웃 폭은 한 번에 확정하고, "넓어지는 모습"은 transform 으로만 연출.
       폭을 매 프레임 바꾸면 이동 중 레이아웃이 계속 재계산되고 뒤쪽 슬라이드가 일정하게 움직이지 않아 끊겨 보이므로,
       늘어난 폭(delta)만큼 뒤쪽 요소를 -delta → 0 으로 되돌리는 방식(FLIP)을 사용 (transform/opacity 는 레이아웃 비용 없음) */
    function textExpand(swiper, animate, wrap){
        const onIdx = textOnIndex(swiper, wrap);
        const slides = swiper.slides.toArray ? swiper.slides.toArray() : Array.prototype.slice.call(swiper.slides),
            imgs = slides.map(function(s){ return s.querySelector(".img-area"); }),
            /* 슬라이드·이미지의 위치. 이동 시작 시에는 레이아웃 위치(offsetLeft: transform 영향 없음),
               이동 종료 후(wrap)에는 update() 로 wrapper 가 보정되므로 실제 화면 위치(getBoundingClientRect)로 측정 */
            measure = function(){
                return slides.map(function(s, i){
                    return wrap ? [s.getBoundingClientRect().left, imgs[i].getBoundingClientRect().left] : [s.offsetLeft, s.offsetLeft + imgs[i].offsetLeft];
                });
            },
            targets = slides.filter(function(s){
                return onIdx.indexOf(Number(s.getAttribute("data-swiper-slide-index"))) > -1 && !s.classList.contains("on");
            });
        if(!targets.length) return;

        const before = measure();
        targets.forEach(function(s){ s.classList.add("on"); });
        /* wrap: 활성 슬라이드 앞쪽 복제가 넓어져 밀린 위치를 update() 로 즉시 보정한 뒤 측정 (활성 슬라이드는 제자리) */
        if(wrap) swiper.update();
        const after = measure();

        if(animate && slides[0].animate){
            /* 요소마다 "위치가 밀린 만큼(-shift → 0)" 애니메이션을 딱 한 번만 걸어 겹침/합산 문제 없이 시각 위치를 유지 */
            slides.forEach(function(s, i){
                const shift = before[i][0] - after[i][0],
                    imgShift = (before[i][1] - after[i][1]) - shift;
                if(shift) s.animate([{transform:"translateX(" + shift + "px)"}, {transform:"translateX(0)"}], {duration:600, easing:"ease"});
                if(imgShift) imgs[i].animate([{transform:"translateX(" + imgShift + "px)"}, {transform:"translateX(0)"}], {duration:600, easing:"ease"});
            });
            targets.forEach(function(s){
                /* clip-path 애니메이션은 실제 Chrome 에서 탭 멈춤(STATUS_BREAKPOINT)과 함께 재현되어 opacity 만 사용 */
                s.querySelector(".txt-area").animate([{opacity:0}, {opacity:1}], {duration:600, easing:"ease"});
            });
        }
        const changed = true;
        /* loop 앞쪽 복제 슬라이드가 넓어지면 활성 슬라이드의 위치도 밀리므로, 이동 목표를 새 폭 기준으로 다시 계산해 이어서 이동
           (안 하면 이동이 끝난 뒤 목표와 실제 위치가 어긋나 한 번에 튐) */
        if(!wrap && animate && changed){
            /* - 이 함수는 transitionStart 이벤트 안에서 실행되므로 그 자리에서 slideTo 를 부르면 "이동 종료" 리스너가
                 runCallbacks=false 로 등록되어 slideChangeTransitionEnd 가 발생하지 않음 → 한 틱 뒤에 실행
               - slideTo 는 previousIndex 도 덮어써서 같은 문제가 생기므로 값을 보존 */
            const prevIndex = swiper.previousIndex;
            setTimeout(function(){
                if(swiper.destroyed) return;
                swiper.updateSlides();
                swiper.slideTo(swiper.activeIndex, swiper.params.speed, false, true);
                swiper.previousIndex = prevIndex;
            }, 0);
        }
    }
    /* 접힘(이동 종료 후): 즉시 접고 update() 로 위치 재계산 */
    function textCollapse(swiper){
        const onIdx = textOnIndex(swiper);
        $(swiper.slides).each(function(){
            if(onIdx.indexOf(Number($(this).attr("data-swiper-slide-index"))) > -1) return;
            $(this).removeClass("on");
        });
        swiper.update();
    }

    const swiper = new Swiper($slider[0], {
        slidesPerView:"auto",
        spaceBetween:20,
        slidesOffsetBefore:100,
        loop:true,
        loopedSlides:5,
        speed:500,
        grabCursor:true,
        autoplay:{delay:3000, disableOnInteraction:false},
        breakpoints:{
            /* 모바일: 활성 슬라이드를 화면 중앙에 배치 (카드 폭이 64vw 로 일정해 텍스트 노출과 무관하게 중앙 유지) */
            767:{slidesOffsetBefore:0, spaceBetween:12, centeredSlides:true},
            1279:{slidesOffsetBefore:40, spaceBetween:20}
        },
        on:{
            init:function(){ textExpand(this, false); textCollapse(this); },
            /* 안전장치: 이동 중 목표를 다시 잡는 과정 등에서 브라우저의 transitionend 가 누락되면
               Swiper 가 계속 "이동 중"으로 남아 자동 재생·드래그가 멈춤 → 이동 시간이 지나도 끝나지 않았으면 직접 종료 이벤트를 보냄 */
            transitionStart:function(){
                const swiper = this;
                clearTimeout(swiper.dyWatchdog);
                swiper.dyWatchdog = setTimeout(function(){
                    if(swiper.destroyed || !swiper.animating) return;
                    swiper.$wrapperEl[0].dispatchEvent(new Event("transitionend"));
                }, swiper.params.speed + 400);
            },
            slideChangeTransitionStart:function(){ textExpand(this, true); },
            slideChangeTransitionEnd:function(){ textCollapse(this); textExpand(this, true, true); }
        }
    });
    dyAutoplayInView($slider[0], swiper);

    /* 1279 경계를 넘으면 텍스트 노출 개수(1개 ↔ 2개)를 즉시 다시 적용 (addListener: 구형 Safari 호환) */
    mqSingle.addListener(function(){
        setTimeout(function(){
            if(swiper.destroyed) return;
            textCollapse(swiper);
            textExpand(swiper, false);
            swiper.update();
        }, 0);
    });
}

function dyDoctorSlider(){
    const $slider = $(".dy-doctor-slider");
    if(!$slider.length) return;
    const $progress = $(".dy-doctor-ctrl .dy-progress");
    /* 화면의 첫 번째 슬라이드(활성 슬라이드)에만 .on → 이미지 높이 325px → 513px (CSS transition).
       슬라이드 폭은 모두 같아(slidesPerView:3) 높이만 바뀌므로 가로 위치에는 영향 없음 */
    function onUpdate(swiper){
        $(swiper.slides).removeClass("on").eq(swiper.activeIndex).addClass("on");
    }
    const swiper = new Swiper($slider[0], {
        slidesPerView:3,
        spaceBetween:20,
        speed:500,
        grabCursor:true,
        autoplay:{delay:3000, disableOnInteraction:false},
        navigation:{nextEl:".dy-doctor-ctrl .dy-arrow-next", prevEl:".dy-doctor-ctrl .dy-arrow-prev"},
        /* 노출 개수가 바뀌면 CSS 의 --dy-doctor-card 계산식도 함께 맞춤 (daisy.css 반응형) */
        breakpoints:{767:{slidesPerView:2, spaceBetween:12}},
        on:{
            init:function(){ onUpdate(this); dyProgressUpdate($progress, this, true); },
            slideChange:function(){ onUpdate(this); },
            progress:function(){ dyProgressUpdate($progress, this, true); }
        }
    });
    /* 섹션이 화면에 노출됐을 때만 자동 재생 */
    dyAutoplayInView($slider[0], swiper);
}

function dySpaceSlider(){
    const $slider = $(".dy-space-slider");
    if(!$slider.length) return;
    const $count = $(".dy-space-count");
    new Swiper($slider[0], {
        speed:600,
        navigation:{nextEl:".dy-space-next", prevEl:".dy-space-prev"},
        on:{
            init:function(){ dyCountUpdate($count, this); },
            slideChange:function(){ dyCountUpdate($count, this); }
        }
    });
}

function dyBaSlider(){
    const $slider = $(".dy-ba-slider");
    if(!$slider.length) return;
    const $progress = $(".dy-ba-ctrl .dy-progress");
    new Swiper($slider[0], {
        slidesPerView:3,
        spaceBetween:20,
        speed:500,
        grabCursor:true,
        /* 모바일: 활성 슬라이드를 화면 중앙에 배치 */
        breakpoints:{767:{slidesPerView:1.5, spaceBetween:12, centeredSlides:true}},
        on:{
            init:function(){ dyProgressUpdate($progress, this); },
            progress:function(){ dyProgressUpdate($progress, this); }
        }
    });
}

/* FAQ 아코디언 */
function dyFaqAction(){
    const $item = $(".dy-faq-item");
    if(!$item.length) return;

    /* .on 은 CSS 의 기본 노출용(초기 펼침). 애니메이션은 jQuery slide 로 처리하므로 slideUp 이 끝난 뒤에 제거 */
    function slideClose($target){
        $target.find(".dy-faq-head").attr("aria-expanded", "false");
        $target.find(".dy-faq-cont").stop(true, true).slideUp(300, function(){ $target.removeClass("on"); });
    }

    $item.find(".dy-faq-head").on("click", function(){
        const $parent = $(this).closest(".dy-faq-item"),
            isOpen = $(this).attr("aria-expanded") === "true";

        slideClose($item.not($parent).filter(function(){ return $(this).find(".dy-faq-head").attr("aria-expanded") === "true"; }));

        if(isOpen){
            slideClose($parent);
        }else{
            $(this).attr("aria-expanded", "true");
            $parent.addClass("on").find(".dy-faq-cont").stop(true, true).hide().slideDown(300);
        }
    });
}

/* 영상 탭 (GUIDE / STORY) */
function dyTabAction(){
    dyTabPanelAction(".dy-film-cont", ".dy-tab", ".dy-film-panel");
}

/* 칼럼 카테고리 탭 */
function dyCateAction(){
    dyTabPanelAction(".dy-journal-tab-area", ".dy-cate", ".dy-journal-cont");
}

/* 공통 탭: data-tab 패널 전환 + 좌우 방향키 이동 */
function dyTabPanelAction(area, tab, cont){
    $(area).each(function(){
        const $area = $(this),
            $tab = $area.find(tab),
            $cont = $area.find(cont);

        function select($target){
            $tab.removeClass("on").attr({"aria-selected":"false", "tabindex":"-1"});
            $target.addClass("on").attr("aria-selected", "true").removeAttr("tabindex");
            $cont.removeClass("on");
            $("#" + $target.data("tab")).addClass("on");
        }

        $tab.on("click", function(){
            select($(this));
        });

        $tab.on("keydown", function(e){
            const idx = $tab.index(this),
                len = $tab.length;
            let next = null;

            if(e.key === "ArrowRight") next = (idx + 1) % len;
            else if(e.key === "ArrowLeft") next = (idx - 1 + len) % len;
            else if(e.key === "Home") next = 0;
            else if(e.key === "End") next = len - 1;
            if(next === null) return;

            e.preventDefault();
            select($tab.eq(next));
            $tab.eq(next).trigger("focus");
        });
    });
}

/* 인기시술 칩 → 검색창 입력 */
function dyChipAction(){
    const $inp = $(".dy-search-inp");
    $(".dy-chip-list").on("click", ".dy-chip", function(){
        $inp.val($(this).text()).trigger("focus");
    });
}

/* Lenis 부드러운 스크롤: 네이티브 scroll 이벤트가 그대로 발생 */
function dyLenisAction(){
    if(typeof Lenis === "undefined") return;

    dyLenis = new Lenis({
        duration:1.2,
        smoothWheel:true
    });

    function dyLenisRaf(time){
        dyLenis.raf(time);
        requestAnimationFrame(dyLenisRaf);
    }
    requestAnimationFrame(dyLenisRaf);
}
