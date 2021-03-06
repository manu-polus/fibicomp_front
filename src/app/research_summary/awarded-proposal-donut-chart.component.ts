import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { GoogleChartService } from '../research_summary/google-chart.service';
import { DashboardService } from '../dashboard/dashboard.service';
import { DashboardData } from '../dashboard/dashboard-data.service';
import { ExpandedviewService } from '../research_summary/expanded-view.service';
import { ExpandedViewDataService } from './expanded-view-data-service';
import { ISubscription } from "rxjs/Subscription";

declare var google: any;

@Component( {
    selector: 'awarded-proposal-donut-chart',
    template: `  
  <div id="donut_award_chart" class="col-xl-6 col-lg-6 col-md-6 col-sm-6 col-xs-6" (window:resize)="onResize($event)"></div>`,
} )

export class AwardedProposalDonutChartComponent extends GoogleChartService implements OnInit {
    private proposalOptions;
    private awardOptions;
    private proposalData;
    private proposalChart;
    private awardChart;
    private awardData;
    private resultPie: any = {};
    private awardList: any[];
    private proposalList: any[];
    private awardStateList: any[] = [];
    private awardLength: number;
    private proposalStateList: any[] = [];
    private proposalLength: number;
    private statuscode: any[] = [];
    private proposalstatuscode: any[] = [];
    private sponsorType: string;
    private proposalType: string;

    private subscription: ISubscription;

    constructor( private ref: ChangeDetectorRef, private dashboardService: DashboardService, private router: Router, public expandedViewDataservice: ExpandedViewDataService, public dashboardData: DashboardData ) {
        super();
    }

    ngOnInit() {
        this.subscription = this.dashboardData.dashboardPieChartData1Variable.subscribe( dashboardPieChartData => {
            if ( dashboardPieChartData.summaryAwardDonutChart != undefined ) {
                this.resultPie = dashboardPieChartData;
                super.googleChartFunction();
            }
            this.ref.detectChanges();
        } );
    }

    ngOnDestroy() {
        if ( this.subscription )
            this.subscription.unsubscribe();
        this.resultPie = {};
    }

    drawGraph() {
        this.expandedViewDataservice.setDonutChartIndex('');
        this.expandedViewDataservice.setResearchSummaryIndex('');
        this.resultPie = this.dashboardData.getDashboardPieChartData();
        if ( this.resultPie != null && this.resultPie.summaryAwardDonutChart !== undefined ) {
            this.awardList = this.resultPie.summaryAwardDonutChart;
            this.awardStateList = [];
            this.awardStateList.push( ['Task', 'Hours per Day'] );
            this.awardLength = this.awardList.length;
            for ( let i = 0; i < this.awardLength; i++ ) {
                this.statuscode.push( [this.awardList[i][0], this.awardList[i][1]] );
                this.awardStateList.push( [this.awardList[i][1], this.awardList[i][2]] );
            }
            this.awardData = google.visualization.arrayToDataTable( this.awardStateList );
            this.awardOptions = {
                //title: 'Awarded Proposals By Sponsors',
                legend: { position: 'right', alignment: 'center', textStyle: {color: '#424242', fontSize: 13, fontName: 'Segoe UI'} },
                colors: ['#E25B5F', '#EC407A', '#C76FD7', '#7E57C2', '#5E6ABE',
                    '#7BCFFF', '#2AB6F4', '#25C8D9', '#24A095', '#68B96A',
                    '#9CCC66', '#E5F37A', '#FFF15A', '#FDD154', '#FFA827',
                    '#FF7143', '#8C6E63', '#BDBDBD', '#78909C'],
                pieHole: 0.2,
                //pieStartAngle: 90,
               /* slices: {
                    1: { offset: 0.2 },
                    2: { offset: 0.2 },
                    14: { offset: 0.4 },
                    4: { offset: 0.5 },
                }*/
                chartArea: { width:'140%', height:'140%'}
            };
            this.awardChart = this.createPiChart( document.getElementById( 'donut_award_chart' ) );
            this.awardChart.draw( this.awardData, this.awardOptions );
            google.visualization.events.addListener( this.awardChart, 'select', ( event ) => {
                this.expandedViewDataservice.setDonutChartIndex('AWARDED');
                var selection = this.awardChart.getSelection();
                for ( var i = 0; i < selection.length; i++ ) {
                    var item = selection[i];
                    if ( item.row != null ) {
                        this.sponsorType = this.awardData.getFormattedValue( item.row, 0 );
                        for ( let j = 0; j < this.statuscode.length; j++ ) {
                            if ( this.sponsorType === this.statuscode[j][1] ) {
                                this.expandedViewDataservice.setSponsorCode( this.statuscode[j][0]);
                                this.expandedViewDataservice.setExpandedDonutViewAwardHeading( "Awards by " + this.sponsorType );
                                this.router.navigate( ['/expandedview'],{queryParams : {"donutchartIndex" : "AWARDED","sponsorCode" :this.statuscode[j][0],"donutAwardHeading":"Awards by " + this.sponsorType}} );
                                break;
                            }
                        }
                    }
                }
            } );
            google.visualization.events.addListener( this.awardChart, 'onmouseover', ( event ) => {
                document.getElementById( 'donut_award_chart' ).style.cursor = 'pointer';
            } );
            google.visualization.events.addListener( this.awardChart, 'onmouseout', ( event ) => {
                document.getElementById( 'donut_award_chart' ).style.cursor = '';
            } );
        }
    }

    onResize( event ) {
        if ( this.resultPie != null && this.resultPie.summaryAwardDonutChart !== undefined ) {
            this.awardChart.draw( this.awardData, this.awardOptions );
        }
    }
} 
